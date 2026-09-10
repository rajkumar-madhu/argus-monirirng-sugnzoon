package rules

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/statementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/logsstatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/metricsstatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/tracesstatementbuilder"
	"github.com/your-org/argus/pkg/telemetrystore"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
	"github.com/your-org/argus/pkg/types/telemetrytypes/telemetrytypestest"

	"github.com/your-org/argus/pkg/flagger/flaggertest"
)

func prepareQuerierForMetrics(t *testing.T, telemetryStore telemetrystore.TelemetryStore) (querier.Querier, *telemetrytypestest.MockMetadataStore) {
	providerSettings := instrumentationtest.New().ToProviderSettings()
	metadataStore := telemetrytypestest.NewMockMetadataStore()

	fl, err := flagger.New(
		context.Background(),
		instrumentationtest.New().ToProviderSettings(),
		flagger.Config{},
		flagger.MustNewRegistry(),
	)
	require.NoError(t, err)

	metricStmtBuilder, err := metricsstatementbuilder.NewFactory(metadataStore, fl).New(context.Background(), providerSettings, statementbuilder.Config{})
	require.NoError(t, err)

	return querier.New(
		providerSettings,
		telemetryStore,
		metadataStore,
		nil, // prometheus
		nil, // promV2
		nil, // traceStmtBuilder
		nil, // aiTraceStmtBuilder
		nil, // logStmtBuilder
		nil, // auditStmtBuilder
		metricStmtBuilder,
		nil, // meterStmtBuilder
		nil, // traceOperatorStmtBuilder
		nil, // bucketCache
		fl,
		0,
		0, // maxConcurrentQueries (0 means default)
	), metadataStore
}

func prepareQuerierForLogs(t *testing.T, telemetryStore telemetrystore.TelemetryStore, keysMap map[string][]*telemetrytypes.TelemetryFieldKey) querier.Querier {
	t.Helper()
	providerSettings := instrumentationtest.New().ToProviderSettings()
	metadataStore := telemetrytypestest.NewMockMetadataStore()

	for _, keys := range keysMap {
		for _, key := range keys {
			key.Signal = telemetrytypes.SignalLogs
		}
	}
	metadataStore.KeysMap = keysMap

	fl := flaggertest.New(t)
	logStmtBuilder, err := logsstatementbuilder.NewFactory(nil, metadataStore, fl).New(context.Background(), providerSettings, statementbuilder.Config{})
	require.NoError(t, err)

	return querier.New(
		providerSettings,
		telemetryStore,
		metadataStore,
		nil, // prometheus
		nil, // promV2
		nil, // traceStmtBuilder
		nil, // aiTraceStmtBuilder
		logStmtBuilder,
		nil, // auditStmtBuilder
		nil, // metricStmtBuilder
		nil, // meterStmtBuilder
		nil, // traceOperatorStmtBuilder
		nil, // bucketCache
		fl,
		5*time.Minute, // logTraceIDWindowPadding
		0,             // maxConcurrentQueries (0 means default)
	)
}

func prepareQuerierForTraces(t *testing.T, telemetryStore telemetrystore.TelemetryStore, keysMap map[string][]*telemetrytypes.TelemetryFieldKey) querier.Querier {
	t.Helper()

	providerSettings := instrumentationtest.New().ToProviderSettings()
	metadataStore := telemetrytypestest.NewMockMetadataStore()

	for _, keys := range keysMap {
		for _, key := range keys {
			key.Signal = telemetrytypes.SignalTraces
		}
	}
	metadataStore.KeysMap = keysMap

	fl := flaggertest.New(t)
	traceStmtBuilder, err := tracesstatementbuilder.NewFactory(telemetryStore, metadataStore, fl).New(context.Background(), providerSettings, statementbuilder.Config{})
	require.NoError(t, err)

	return querier.New(
		providerSettings,
		telemetryStore,
		metadataStore,
		nil, // prometheus
		nil, // promV2
		traceStmtBuilder,
		nil, // aiTraceStmtBuilder
		nil, // logStmtBuilder
		nil, // auditStmtBuilder
		nil, // metricStmtBuilder
		nil, // meterStmtBuilder
		nil, // traceOperatorStmtBuilder
		nil, // bucketCache
		fl,
		0,
		0, // maxConcurrentQueries (0 means default)
	)
}
