package telemetrytypes

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewTelemetryGrantSelector(t *testing.T) {
	valid := map[string]string{
		"*":                                      "*",
		"builder_query":                          "builder_query/*",
		"builder_query/*":                        "builder_query/*",
		"promql":                                 "promql/*",
		"clickhouse_sql":                         "clickhouse_sql/*",
		"builder_query/argus.workspace.key.id/*": "builder_query/argus.workspace.key.id/*",
		"builder_query/argus.workspace.key.id/key-a":          "builder_query/argus.workspace.key.id/key-a",
		"builder_query/resource.argus.workspace.key.id/key-a": "builder_query/argus.workspace.key.id/key-a",
		"builder_query/argus.workspace.key.id/key a":          "builder_query/argus.workspace.key.id/key a",
		"builder_query/argus.workspace.key.id/a/b":            "builder_query/argus.workspace.key.id/a/b",
	}
	for input, expected := range valid {
		canonical, err := NewTelemetryGrantSelector(input)
		require.NoError(t, err, "input %q", input)
		assert.Equal(t, expected, canonical, "input %q", input)
	}

	invalid := []string{
		"",
		"key-a",
		"argus.workspace.key.id = 'key-a'",
		"builder_trace_operator/argus.workspace.key.id/key-a",
		"builder_query/service.name/frontend",
		"builder_query/argus.workspace.key.id/",
		"builder_query/argus.workspace.key.id/$svc",
		"*/argus.workspace.key.id/key-a",
		"builder_query/argus.workspace.key.id",
		"clickhouse_sql/argus.workspace.key.id/key-a",
		"clickhouse_sql/argus.workspace.key.id/*",
		"promql/argus.workspace.key.id/key-a",
	}
	for _, input := range invalid {
		_, err := NewTelemetryGrantSelector(input)
		assert.Error(t, err, "input %q", input)
	}
}

func TestNewTelemetryGrantKey(t *testing.T) {
	valid := map[string]string{
		"argus.workspace.key.id":          "argus.workspace.key.id",
		"resource.argus.workspace.key.id": "argus.workspace.key.id",
	}
	for keyText, expected := range valid {
		key, ok := NewTelemetryGrantKey(keyText)
		assert.True(t, ok, keyText)
		assert.Equal(t, expected, key, keyText)
	}

	for _, keyText := range []string{"service.name", "attribute.argus.workspace.key.id", "body.argus.workspace.key.id"} {
		_, ok := NewTelemetryGrantKey(keyText)
		assert.False(t, ok, keyText)
	}
}

func TestNewTelemetryGrantSelectors(t *testing.T) {
	ladders := map[string][]string{
		"*":                                      {"*"},
		"builder_query/*":                        {"builder_query/*", "*"},
		"promql/*":                               {"promql/*", "*"},
		"builder_query/argus.workspace.key.id/*": {"builder_query/argus.workspace.key.id/*", "builder_query/*", "*"},
		"builder_query/argus.workspace.key.id/a": {"builder_query/argus.workspace.key.id/a", "builder_query/argus.workspace.key.id/*", "builder_query/*", "*"},
		"builder_query/argus.workspace.key.id/a/b": {"builder_query/argus.workspace.key.id/a/b", "builder_query/argus.workspace.key.id/*", "builder_query/*", "*"},
	}
	for selector, expected := range ladders {
		assert.Equal(t, expected, NewTelemetryGrantSelectors(selector), "selector %q", selector)
	}
}
