package cmd

import (
	"context"
	"log/slog"

	"github.com/spf13/cobra"
	"github.com/your-org/argus/pkg/argus"
	"github.com/your-org/argus/pkg/instrumentation"
	"github.com/your-org/argus/pkg/version"
)

func registerGenerateOpenAPI(parentCmd *cobra.Command) {
	openapiCmd := &cobra.Command{
		Use:   "openapi",
		Short: "Generate OpenAPI schema for Argus",
		RunE: func(currCmd *cobra.Command, args []string) error {
			return runGenerateOpenAPI(currCmd.Context())
		},
	}

	parentCmd.AddCommand(openapiCmd)
}

func runGenerateOpenAPI(ctx context.Context) error {
	instrumentation, err := instrumentation.New(ctx, instrumentation.Config{Logs: instrumentation.LogsConfig{Level: slog.LevelInfo}}, version.Info, "argus")
	if err != nil {
		return err
	}

	openapi, err := argus.NewOpenAPI(ctx, instrumentation)
	if err != nil {
		return err
	}

	if err := openapi.CreateAndWrite("docs/api/openapi.yml"); err != nil {
		return err
	}

	return nil
}
