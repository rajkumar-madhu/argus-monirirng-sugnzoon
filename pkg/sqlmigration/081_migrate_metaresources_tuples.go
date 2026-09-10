package sqlmigration

import (
	"context"
	"time"

	"github.com/oklog/ulid/v2"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect"
	"github.com/uptrace/bun/migrate"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/types/authtypes"
)

type migrateMetaresourcesTuples struct {
	sqlstore sqlstore.SQLStore
}

func NewMigrateMetaresourcesTuplesFactory(sqlstore sqlstore.SQLStore) factory.ProviderFactory[SQLMigration, Config] {
	return factory.NewProviderFactory(factory.MustNewName("migrate_metaresources_tuples"), func(ctx context.Context, ps factory.ProviderSettings, c Config) (SQLMigration, error) {
		return &migrateMetaresourcesTuples{sqlstore: sqlstore}, nil
	})
}

func (migration *migrateMetaresourcesTuples) Register(migrations *migrate.Migrations) error {
	return migrations.Register(migration.Up, migration.Down)
}

// migrationTuple describes a single FGA tuple to insert.
type migrationTuple struct {
	roleName   string // "signoz-admin", "signoz-editor", "signoz-viewer"
	objectType string // "serviceaccount", "user", "role", "metaresource"
	objectName string // "serviceaccount", "user", "role", etc.
	relation   string // "create", "list", "detach", etc.
}

func (migration *migrateMetaresourcesTuples) Up(ctx context.Context, db *bun.DB) error {
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

	// Fetch all orgs.
	var orgIDs []string
	rows, err := tx.QueryContext(ctx, `SELECT id FROM organizations`)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var orgID string
		if err := rows.Scan(&orgID); err != nil {
			return err
		}
		orgIDs = append(orgIDs, orgID)
	}

	isPG := migration.sqlstore.BunDB().Dialect().Name() == dialect.PG

	// Step 1: Delete all tuples with the old "metaresources" object_type.
	for _, orgID := range orgIDs {
		if isPG {
			_, err = tx.ExecContext(ctx, `DELETE FROM tuple WHERE store = ? AND object_type = ? AND object_id LIKE ?`,
				storeID, "metaresources", "organization/"+orgID+"/%")
		} else {
			_, err = tx.ExecContext(ctx, `DELETE FROM tuple WHERE store = ? AND object_type = ? AND object_id LIKE ?`,
				storeID, "metaresources", "organization/"+orgID+"/%")
		}

		if err != nil {
			return err
		}
	}

	// Step 2: Insert replacement tuples.
	// For types with their own FGA type (user, serviceaccount, role), create/list
	// go on the type directly. For all other resources, create/list go on "metaresource".
	// Also add new detach tuples for role/user/serviceaccount.
	tuples := []migrationTuple{
		// New detach tuples for admin
		{authtypes.ArgusAdminRoleName, "role", "role", "detach"},
		{authtypes.ArgusAdminRoleName, "serviceaccount", "serviceaccount", "detach"},
		// Replacement create/list for user/serviceaccount/role (moved from metaresources to own types)
		{authtypes.ArgusAdminRoleName, "serviceaccount", "serviceaccount", "create"},
		{authtypes.ArgusAdminRoleName, "serviceaccount", "serviceaccount", "list"},
		{authtypes.ArgusAdminRoleName, "role", "role", "create"},
		{authtypes.ArgusAdminRoleName, "role", "role", "list"},
		// Replacement create/list for resources that move from "metaresources" to "metaresource"
		{authtypes.ArgusAdminRoleName, "metaresource", "factor-api-key", "create"},
		{authtypes.ArgusAdminRoleName, "metaresource", "factor-api-key", "list"},
		{authtypes.ArgusAdminRoleName, "metaresource", "factor-api-key", "read"},
		{authtypes.ArgusAdminRoleName, "metaresource", "factor-api-key", "update"},
		{authtypes.ArgusAdminRoleName, "metaresource", "factor-api-key", "delete"},
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
					storeID, tuple.objectType, objectID, tuple.relation, user, "TUPLE_OPERATION_WRITE", tupleID, now,
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

	return tx.Commit()
}

func (migration *migrateMetaresourcesTuples) Down(context.Context, *bun.DB) error {
	return nil
}
