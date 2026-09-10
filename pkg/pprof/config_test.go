package pprof

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/config"
	"github.com/your-org/argus/pkg/config/envprovider"
	"github.com/your-org/argus/pkg/factory"
)

func TestNewWithEnvProvider(t *testing.T) {
	t.Setenv("ARGUS_PPROF_ENABLED", "false")
	t.Setenv("ARGUS_PPROF_ADDRESS", "127.0.0.1:6061")

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

	actual := Config{}
	err = conf.Unmarshal("pprof", &actual)
	require.NoError(t, err)

	expected := Config{
		Enabled: false,
		Address: "127.0.0.1:6061",
	}

	assert.Equal(t, expected, actual)
}
