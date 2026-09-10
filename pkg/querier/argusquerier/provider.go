package argusquerier

import (
	"context"

	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/telemetrystore"
	qbtypes "github.com/your-org/argus/pkg/types/querybuildertypes/querybuildertypesv5"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
)

// NewFactory creates a new factory for the signoz querier provider. The query
// stack (metadata store, statement builders, bucket cache) is assembled once in
// argus.go and injected here.
func NewFactory(
	telemetryStore telemetrystore.TelemetryStore,
	prometheus prometheus.Prometheus,
	promV2 prometheus.Prometheus,
	metadataStore telemetrytypes.MetadataStore,
	traceStmtBuilder qbtypes.StatementBuilder[qbtypes.TraceAggregation],
	aiTraceStmtBuilder qbtypes.StatementBuilder[qbtypes.TraceAggregation],
	logStmtBuilder qbtypes.StatementBuilder[qbtypes.LogAggregation],
	auditStmtBuilder qbtypes.StatementBuilder[qbtypes.LogAggregation],
	metricStmtBuilder qbtypes.StatementBuilder[qbtypes.MetricAggregation],
	meterStmtBuilder qbtypes.StatementBuilder[qbtypes.MetricAggregation],
	traceOperatorStmtBuilder qbtypes.TraceOperatorStatementBuilder,
	bucketCache querier.BucketCache,
	flagger flagger.Flagger,
) factory.ProviderFactory[querier.Querier, querier.Config] {
	return factory.NewProviderFactory(
		factory.MustNewName("argus"),
		func(
			_ context.Context,
			settings factory.ProviderSettings,
			cfg querier.Config,
		) (querier.Querier, error) {
			return querier.New(
				settings,
				telemetryStore,
				metadataStore,
				prometheus,
				promV2,
				traceStmtBuilder,
				aiTraceStmtBuilder,
				logStmtBuilder,
				auditStmtBuilder,
				metricStmtBuilder,
				meterStmtBuilder,
				traceOperatorStmtBuilder,
				bucketCache,
				flagger,
				cfg.LogTraceIDWindowPadding,
				cfg.MaxConcurrentQueries,
			), nil
		},
	)
}
