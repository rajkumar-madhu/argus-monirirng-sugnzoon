package auditor

import (
	"context"

	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/types/audittypes"
)

var (
	ErrCodeAuditExportFailed = errors.MustNewCode("audit_export_failed")
)

type Auditor interface {
	factory.ServiceWithHealthy

	// Audit emits an audit event. It is fire-and-forget: callers never block on audit outcomes.
	Audit(ctx context.Context, event audittypes.AuditEvent)
}
