package statsreporter

import (
	"context"

	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/valuer"
)

type StatsReporter interface {
	factory.Service

	Report(context.Context) error
}

type StatsCollector interface {
	Collect(context.Context, valuer.UUID) (map[string]any, error)
}
