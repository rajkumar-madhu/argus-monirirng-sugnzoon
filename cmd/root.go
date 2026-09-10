package cmd

import (
	"log/slog"
	"os"

	"github.com/spf13/cobra"

	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/version"
)

var RootCmd = &cobra.Command{
	Use:               "argus",
	Short:             "OpenTelemetry-Native Logs, Metrics and Traces in a single pane",
	Version:           version.Info.Version(),
	SilenceUsage:      true,
	SilenceErrors:     true,
	CompletionOptions: cobra.CompletionOptions{DisableDefaultCmd: true},
}

func Execute(logger *slog.Logger) {
	err := RootCmd.Execute()
	if err != nil {
		logger.ErrorContext(RootCmd.Context(), "error running command", errors.Attr(err))
		os.Exit(1)
	}
}
