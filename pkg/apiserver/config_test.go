package apiserver

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/config"
	"github.com/your-org/argus/pkg/config/envprovider"
	"github.com/your-org/argus/pkg/factory"
	httpserver "github.com/your-org/argus/pkg/http/server"
)

func TestNewWithEnvProvider(t *testing.T) {
	t.Setenv("ARGUS_APISERVER_ADDRESS", "0.0.0.0:9090")
	t.Setenv("ARGUS_APISERVER_READ__TIMEOUT", "80s")
	t.Setenv("ARGUS_APISERVER_TLS_ENABLED", "true")
	t.Setenv("ARGUS_APISERVER_TLS_CERT__FILE", "/etc/argus/server.crt")
	t.Setenv("ARGUS_APISERVER_TLS_KEY__FILE", "/etc/argus/server.key")
	t.Setenv("ARGUS_APISERVER_TLS_MIN__VERSION", "1.3")
	t.Setenv("ARGUS_APISERVER_TIMEOUT_DEFAULT", "70s")
	t.Setenv("ARGUS_APISERVER_TIMEOUT_MAX", "700s")
	t.Setenv("ARGUS_APISERVER_TIMEOUT_EXCLUDED__ROUTES", "/excluded1,/excluded2")
	t.Setenv("ARGUS_APISERVER_LOGGING_EXCLUDED__ROUTES", "/api/v1/health1")

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
	err = conf.Unmarshal("apiserver", actual)

	require.NoError(t, err)

	expected := &Config{
		Config: httpserver.Config{
			Address:     "0.0.0.0:9090",
			ReadTimeout: 80 * time.Second,
			TLS: httpserver.TLS{
				Enabled:    true,
				CertFile:   "/etc/argus/server.crt",
				KeyFile:    "/etc/argus/server.key",
				MinVersion: "1.3",
			},
		},
		Timeout: Timeout{
			Default: 70 * time.Second,
			Max:     700 * time.Second,
			ExcludedRoutes: []string{
				"/excluded1",
				"/excluded2",
			},
		},
		Logging: Logging{
			ExcludedRoutes: []string{
				"/api/v1/health1",
			},
		},
	}

	assert.Equal(t, expected, actual)
}
