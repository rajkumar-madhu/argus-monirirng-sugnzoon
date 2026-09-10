package implserviceaccount

import (
	"context"

	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/serviceaccounttypes"
	"github.com/your-org/argus/pkg/valuer"
)

type getter struct {
	store serviceaccounttypes.Store
}

func NewGetter(store serviceaccounttypes.Store) serviceaccount.Getter {
	return &getter{store: store}
}

func (getter *getter) GetServiceAccountRole(ctx context.Context, orgID valuer.UUID, id valuer.UUID) (*serviceaccounttypes.ServiceAccountRole, error) {
	return getter.store.GetServiceAccountRoleByOrgIDAndID(ctx, orgID, id)
}

func (getter *getter) OnBeforeRoleDelete(ctx context.Context, orgID valuer.UUID, roleID valuer.UUID, _ string) error {
	serviceAccounts, err := getter.store.GetServiceAccountsByOrgIDAndRoleID(ctx, orgID, roleID)
	if err != nil {
		return err
	}
	if len(serviceAccounts) > 0 {
		return errors.New(errors.TypeInvalidInput, authtypes.ErrCodeRoleHasServiceAccountAssignees, "role has active service account assignments, remove them before deleting")
	}
	return nil
}
