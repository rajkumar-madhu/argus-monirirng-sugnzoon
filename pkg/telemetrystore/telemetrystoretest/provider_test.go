package telemetrystoretest

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/your-org/argus/pkg/telemetrystore"
)

func TestNew(t *testing.T) {
	provider := New(telemetrystore.Config{Provider: "clickhouse"}, sqlmock.QueryMatcherRegexp)
	assert.NotNil(t, provider)
	assert.NotNil(t, provider.Mock())
	assert.NotNil(t, provider.ClickhouseDB())
}
