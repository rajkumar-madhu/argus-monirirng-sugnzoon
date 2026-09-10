package cmd

import (
	"context"
	"log/slog"

	"github.com/your-org/argus/pkg/argus"
	"github.com/your-org/argus/pkg/config"
	"github.com/your-org/argus/pkg/config/envprovider"
	"github.com/your-org/argus/pkg/config/fileprovider"
)

func NewArgusConfig(ctx context.Context, logger *slog.Logger, configFiles []string) (argus.Config, error) {
	uris := make([]string, 0, len(configFiles)+1)
	for _, f := range configFiles {
		uris = append(uris, "file:"+f)
	}
	uris = append(uris, "env:")

	config, err := argus.NewConfig(
		ctx,
		logger,
		config.ResolverConfig{
			Uris: uris,
			ProviderFactories: []config.ProviderFactory{
				envprovider.NewFactory(),
				fileprovider.NewFactory(),
			},
		},
	)
	if err != nil {
		return argus.Config{}, err
	}

	return config, nil
}
