package sqlmigration

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/oklog/ulid/v2"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect"
	"github.com/uptrace/bun/migrate"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/coretypes"
)

type addIngestionTuples struct {
	sqlstore sqlstore.SQLStore
}

func NewAddIngestionTuplesFactory(sqlstore sqlstore.SQLStore) factory.ProviderFactory[SQLMigration, Config] {
	return factory.NewProviderFactory(factory.MustNewName("add_ingestion_tuples"), func(ctx context.Context, ps factory.ProviderSettings, c Config) (SQLMigration, error) {
		return &addIngestionTuples{sqlstore: sqlstore}, nil
	})
}

func (migration *addIngestionTuples) Register(migrations *migrate.Migrations) error {
	return migrations.Register(migration.Up, migration.Down)
}

func (migration *addIngestionTuples) Up(ctx context.Context, db *bun.DB) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	var storeID string
	err = tx.QueryRowContext(ctx, `SELECT id FROM store WHERE name = ? LIMIT 1`, "argus").Scan(&storeID)
	if err != nil {
		return err
	}

	var orgIDs []string
	err = tx.NewSelect().
		Table("organizations").
		Column("id").
		Scan(ctx, &orgIDs)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	isPG := migration.sqlstore.BunDB().Dialect().Name() == dialect.PG

	// ingestion-key and ingestion-limit moved from the legacy EditAccess role gate to
	// CheckResources, which on enterprise requires real tuples -- existing orgs
	// never had these written, only new orgs get them from the registry at bootstrap.
	tuples := []migrationTuple{
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "create"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "read"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "update"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "delete"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "list"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "attach"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-key", "detach"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-limit", "create"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-limit", "read"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-limit", "update"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-limit", "delete"},
		{authtypes.ArgusAdminRoleName, "metaresource", "ingestion-limit", "list"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "create"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "read"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "update"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "delete"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "list"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "attach"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-key", "detach"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-limit", "create"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-limit", "read"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-limit", "update"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-limit", "delete"},
		{authtypes.ArgusEditorRoleName, "metaresource", "ingestion-limit", "list"},
	}

	for _, orgID := range orgIDs {
		for _, tuple := range tuples {
			entropy := ulid.DefaultEntropy()
			now := time.Now().UTC()
			tupleID := ulid.MustNew(ulid.Timestamp(now), entropy).String()

			objectID := "organization/" + orgID + "/" + tuple.objectName + "/*"
			roleSubject := "organization/" + orgID + "/role/" + tuple.roleName

			if isPG {
				user := "role:" + roleSubject + "#assignee"
				result, err := tx.ExecContext(ctx, `
					INSERT INTO tuple (store, object_type, object_id, relation, _user, user_type, ulid, inserted_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT (store, object_type, object_id, relation, _user) DO NOTHING`,
					storeID, tuple.objectType, objectID, tuple.relation, user, "userset", tupleID, now,
				)
				if err != nil {
					return err
				}
				rowsAffected, err := result.RowsAffected()
				if err != nil {
					return err
				}
				if rowsAffected == 0 {
					continue
				}
				_, err = tx.ExecContext(ctx, `
					INSERT INTO changelog (store, object_type, object_id, relation, _user, operation, ulid, inserted_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT (store, ulid, object_type) DO NOTHING`,
					storeID, tuple.objectType, objectID, tuple.relation, user, 0, tupleID, now,
				)
				if err != nil {
					return err
				}
			} else {
				result, err := tx.ExecContext(ctx, `
					INSERT INTO tuple (store, object_type, object_id, relation, user_object_type, user_object_id, user_relation, user_type, ulid, inserted_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT (store, object_type, object_id, relation, user_object_type, user_object_id, user_relation) DO NOTHING`,
					storeID, tuple.objectType, objectID, tuple.relation, "role", roleSubject, "assignee", "userset", tupleID, now,
				)
				if err != nil {
					return err
				}
				rowsAffected, err := result.RowsAffected()
				if err != nil {
					return err
				}
				if rowsAffected == 0 {
					continue
				}
				_, err = tx.ExecContext(ctx, `
					INSERT INTO changelog (store, object_type, object_id, relation, user_object_type, user_object_id, user_relation, operation, ulid, inserted_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT (store, ulid, object_type) DO NOTHING`,
					storeID, tuple.objectType, objectID, tuple.relation, "role", roleSubject, "assignee", 0, tupleID, now,
				)
				if err != nil {
					return err
				}
			}
		}
	}

	managedRoleGroups := make(map[string]string, len(coretypes.ManagedRoleToTransactions))
	for roleName, transactions := range coretypes.ManagedRoleToTransactions {
		data, err := json.Marshal(authtypes.NewTransactionGroupsFromTransactions(transactions))
		if err != nil {
			return err
		}
		managedRoleGroups[roleName] = string(data)
	}

	for _, orgID := range orgIDs {
		for roleName, data := range managedRoleGroups {
			if _, err := tx.NewUpdate().
				Model(new(roles)).
				Set("transaction_groups = ?", data).
				Where("org_id = ?", orgID).
				Where("type = ?", authtypes.RoleTypeManaged.StringValue()).
				Where("name = ?", roleName).
				Exec(ctx); err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (migration *addIngestionTuples) Down(context.Context, *bun.DB) error {
	return nil
}
