package alertmanager

import (
	"context"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/prometheus/common/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/config"
	"github.com/your-org/argus/pkg/config/envprovider"
	"github.com/your-org/argus/pkg/factory"
)

const prefix = "ARGUS_"

// clearArgusEnv unsets all existing ARGUS_* env vars for the duration of the test.
func clearArgusEnv(t *testing.T) {
	t.Helper()
	for _, kv := range os.Environ() {
		if strings.HasPrefix(kv, prefix) {
			key := strings.SplitN(kv, "=", 2)[0]
			orig, _ := os.LookupEnv(key)
			_ = os.Unsetenv(key)
			t.Cleanup(func() { _ = os.Setenv(key, orig) })
		}
	}
}

func TestNewWithEnvProvider(t *testing.T) {
	clearArgusEnv(t)
	t.Setenv("ARGUS_ALERTMANAGER_PROVIDER", "argus")
	t.Setenv("ARGUS_ALERTMANAGER_LEGACY_API__URL", "http://localhost:9093/api")
	t.Setenv("ARGUS_ALERTMANAGER_ARGUS_ROUTE_REPEAT__INTERVAL", "5m")
	t.Setenv("ARGUS_ALERTMANAGER_ARGUS_EXTERNAL__URL", "https://example.com/test")
	t.Setenv("ARGUS_ALERTMANAGER_ARGUS_GLOBAL_RESOLVE__TIMEOUT", "10s")

	conf, err := config.New(
		context.Background(),
		config.ResolverConfig{
			Uris: []string{"env:"},
			ProviderFactories: []config.ProviderFactory{
				envprovider.NewFactory(),
			},
		},
		[]factory.ConfigFactory{
			NewConfigFactory(),
		},
	)
	require.NoError(t, err)

	actual := &Config{}
	err = conf.Unmarshal("alertmanager", actual, "yaml")
	require.NoError(t, err)

	def := NewConfigFactory().New().(Config)
	def.Argus.Global.ResolveTimeout = model.Duration(10 * time.Second)
	def.Argus.Route.RepeatInterval = 5 * time.Minute
	def.Argus.ExternalURL = &url.URL{
		Scheme: "https",
		Host:   "example.com",
		Path:   "/test",
	}

	expected := &Config{
		Provider: "argus",
		Argus:    def.Argus,
	}

	assert.Equal(t, expected, actual)
	assert.NoError(t, actual.Validate())
}
