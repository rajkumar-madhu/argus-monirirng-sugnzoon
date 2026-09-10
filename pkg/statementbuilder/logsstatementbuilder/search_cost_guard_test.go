package logsstatementbuilder

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/flagger/flaggertest"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
	"github.com/your-org/argus/pkg/querybuilder"
	"github.com/your-org/argus/pkg/statementbuilder"
	"github.com/your-org/argus/pkg/telemetryschema/logstelemetryschema"
	qbtypes "github.com/your-org/argus/pkg/types/querybuildertypes/querybuildertypesv5"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
	"github.com/your-org/argus/pkg/types/telemetrytypes/telemetrytypestest"
	"github.com/your-org/argus/pkg/valuer"
)

// TestSearchCostGuard asserts Build attaches the CostGuard budget and its advisory.
func TestSearchCostGuard(t *testing.T) {
	releaseTime := time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC)
	ctx := context.Background()
	start := uint64(releaseTime.Add(-5 * time.Minute).UnixMilli())
	end := uint64(releaseTime.UnixMilli())

	fl := flaggertest.WithBooleanFlags(t, map[string]bool{})
	fm := logstelemetryschema.NewFieldMapper(fl)
	cb := logstelemetryschema.NewConditionBuilder(fm, fl)
	store := telemetrytypestest.NewMockMetadataStore()
	store.KeysMap = logstelemetryschema.BuildCompleteFieldKeyMap(releaseTime)
	rewriter := querybuilder.NewAggExprRewriter(instrumentationtest.New().ToProviderSettings(), nil, fm, cb, fl)
	sb := NewLogQueryStatementBuilder(
		instrumentationtest.New().ToProviderSettings(),
		store, fm, cb, rewriter, logstelemetryschema.DefaultFullTextColumn, fl, nil,
		statementbuilder.Config{SearchMaxScanRows: 100000, SkipResourceFingerprint: statementbuilder.SkipResourceFingerprint{Enabled: false, Threshold: 100000}},
	)
	query := qbtypes.QueryBuilderQuery[qbtypes.LogAggregation]{
		Signal: telemetrytypes.SignalLogs,
		Filter: &qbtypes.Filter{Expression: "search('error')"},
		Limit:  1,
	}

	stmt, err := sb.Build(ctx, valuer.UUID{}, start, end, qbtypes.RequestTypeRaw, query, nil)
	require.NoError(t, err)
	require.NotNil(t, stmt.CostGuard)
	assert.Equal(t, int64(100000), stmt.CostGuard.MaxScanRows)
	assert.Contains(t, stmt.Warnings, querybuilder.SearchWarning)
}

// TestSearchCostGuardJSONBody asserts body_v2 gets its own, lower budget.
func TestSearchCostGuardJSONBody(t *testing.T) {
	releaseTime := time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC)
	ctx := context.Background()
	start := uint64(releaseTime.Add(-5 * time.Minute).UnixMilli())
	end := uint64(releaseTime.UnixMilli())

	fl := flaggertest.WithUseJSONBody(t, true)
	fm := logstelemetryschema.NewFieldMapper(fl)
	cb := logstelemetryschema.NewConditionBuilder(fm, fl)
	store := telemetrytypestest.NewMockMetadataStore()
	store.KeysMap = logstelemetryschema.BuildCompleteFieldKeyMap(releaseTime)
	rewriter := querybuilder.NewAggExprRewriter(instrumentationtest.New().ToProviderSettings(), nil, fm, cb, fl)
	sb := NewLogQueryStatementBuilder(
		instrumentationtest.New().ToProviderSettings(),
		store, fm, cb, rewriter, logstelemetryschema.DefaultFullTextColumn, fl, nil,
		statementbuilder.Config{
			SearchMaxScanRows:         100000,
			SearchMaxScanRowsJSONBody: 10000,
			SkipResourceFingerprint:   statementbuilder.SkipResourceFingerprint{Enabled: false, Threshold: 100000},
		},
	)
	query := qbtypes.QueryBuilderQuery[qbtypes.LogAggregation]{
		Signal: telemetrytypes.SignalLogs,
		Filter: &qbtypes.Filter{Expression: "search('error')"},
		Limit:  1,
	}

	stmt, err := sb.Build(ctx, valuer.UUID{}, start, end, qbtypes.RequestTypeRaw, query, nil)
	require.NoError(t, err)
	require.NotNil(t, stmt.CostGuard)
	assert.Equal(t, int64(10000), stmt.CostGuard.MaxScanRows)
	assert.Contains(t, stmt.Warnings, querybuilder.SearchWarning)
}
