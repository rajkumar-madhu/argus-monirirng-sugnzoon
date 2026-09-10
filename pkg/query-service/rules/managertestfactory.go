package rules

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/alertmanager"
	alertmanagermock "github.com/your-org/argus/pkg/alertmanager/alertmanagertest"
	"github.com/your-org/argus/pkg/cache"
	"github.com/your-org/argus/pkg/cache/cachetest"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/prometheus/prometheustest"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/querier/argusquerier"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/sqlstore/sqlstoretest"
	"github.com/your-org/argus/pkg/statementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/aistatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/auditstatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/logsstatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/meterstatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/metricsstatementbuilder"
	"github.com/your-org/argus/pkg/statementbuilder/tracesstatementbuilder"
	"github.com/your-org/argus/pkg/telemetrymetadata"
	"github.com/your-org/argus/pkg/telemetrystore"
	"github.com/your-org/argus/pkg/telemetrystore/telemetrystoretest"
)

type queryMatcherAny struct {
}

func (m *queryMatcherAny) Match(x string, y string) error {
	return nil
}

// TestManagerOptions provides options for customizing the test manager creation.
type TestManagerOptions struct {
	// AlertmanagerHook is a function that will be called with the Alertmanager mock
	// after it's created but before it's used. This allows customizing the mock behavior.
	AlertmanagerHook func(alertmanager.Alertmanager)

	// SqlStoreHook is a function that will be called with the SQLStore mock
	// after it's created but before it's used. This allows customizing the mock behavior.
	SqlStoreHook func(sqlstore.SQLStore)

	// TelemetryStoreHook is a function that will be called with the TelemetryStore mock
	// after it's created but before it's used. This allows customizing the mock behavior.
	TelemetryStoreHook func(telemetrystore.TelemetryStore)

	// ManagerOptionsHook is a function that will be called with the ManagerOptions
	// before the manager is created. This allows customizing the manager options (e.g., setting Prometheus).
	ManagerOptionsHook func(*ManagerOptions)
}

// NewTestManager creates a Manager instance for testing purposes.
// It sets up all the necessary mocks and dependencies required for testing.
// Options can be provided to customize the manager behavior. If nil, default options are used.
func NewTestManager(t *testing.T, testOpts *TestManagerOptions) *Manager {
	// mocking the alertmanager + capturing the triggered test alerts
	fAlert := alertmanagermock.NewMockAlertmanager(t)

	// Call the Alertmanager hook if provided
	if testOpts != nil && testOpts.AlertmanagerHook != nil {
		testOpts.AlertmanagerHook(fAlert)
	}

	cacheObj, err := cachetest.New(cache.Config{
		Provider: "memory",
		Memory: cache.Memory{
			NumCounters: 1000,
			MaxCost:     1 << 20,
		},
	})
	require.NoError(t, err)

	// Create SQLStore mock
	sqlStore := sqlstoretest.New(sqlstore.Config{Provider: "sqlite"}, sqlmock.QueryMatcherRegexp)

	// Call the SqlStore hook if provided
	if testOpts != nil && testOpts.SqlStoreHook != nil {
		testOpts.SqlStoreHook(sqlStore)
	}

	// Create TelemetryStore mock
	telemetryStore := telemetrystoretest.New(telemetrystore.Config{}, &queryMatcherAny{})

	// Call the TelemetryStore hook if provided
	if testOpts != nil && testOpts.TelemetryStoreHook != nil {
		testOpts.TelemetryStoreHook(telemetryStore)
	}

	// Create reader with mocked telemetry store
	cache, err := cachetest.New(cache.Config{
		Provider: "memory",
		Memory: cache.Memory{
			NumCounters: 10 * 1000,
			MaxCost:     1 << 26,
		},
	})
	require.NoError(t, err)

	providerSettings := instrumentationtest.New().ToProviderSettings()
	prometheus := prometheustest.New(context.Background(), providerSettings, prometheus.Config{Timeout: 2 * time.Minute}, telemetryStore)

	flagger, err := flagger.New(context.Background(), instrumentationtest.New().ToProviderSettings(), flagger.Config{}, flagger.MustNewRegistry())
	if err != nil {
		t.Fatalf("failed to create flagger: %v", err)
	}

	// Create querier with test values
	metadataStore := telemetrymetadata.NewTelemetryMetaStore(providerSettings, telemetryStore, flagger)
	cfg := statementbuilder.Config{}
	ctx := context.Background()
	traceStmtBuilder, err := tracesstatementbuilder.NewFactory(telemetryStore, metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	aiTraceStmtBuilder, err := aistatementbuilder.NewFactory(telemetryStore, metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	traceOperatorStmtBuilder, err := tracesstatementbuilder.NewOperatorFactory(telemetryStore, metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	logStmtBuilder, err := logsstatementbuilder.NewFactory(telemetryStore, metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	auditStmtBuilder, err := auditstatementbuilder.NewFactory(metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	metricStmtBuilder, err := metricsstatementbuilder.NewFactory(metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	meterStmtBuilder, err := meterstatementbuilder.NewFactory(metadataStore, flagger).New(ctx, providerSettings, cfg)
	require.NoError(t, err)
	bucketCache := querier.NewBucketCache(providerSettings, cache, 0, 0)
	providerFactory := argusquerier.NewFactory(telemetryStore, prometheus, nil, metadataStore, traceStmtBuilder, aiTraceStmtBuilder, logStmtBuilder, auditStmtBuilder, metricStmtBuilder, meterStmtBuilder, traceOperatorStmtBuilder, bucketCache, flagger)
	mockQuerier, err := providerFactory.New(context.Background(), providerSettings, querier.Config{})
	require.NoError(t, err)

	mgrOpts := &ManagerOptions{
		Logger:         instrumentationtest.New().Logger(),
		Cache:          cacheObj,
		Alertmanager:   fAlert,
		Querier:        mockQuerier,
		TelemetryStore: telemetryStore,
		SQLStore:       sqlStore, // SQLStore needed for SendAlerts to query organizations
	}

	// Call the ManagerOptions hook if provided to allow customization
	if testOpts != nil && testOpts.ManagerOptionsHook != nil {
		testOpts.ManagerOptionsHook(mgrOpts)
	}

	mgr, err := NewManager(mgrOpts)
	require.NoError(t, err)

	return mgr
}
