package main

import (
	"context"
	"log/slog"

	"github.com/spf13/cobra"

	"github.com/your-org/argus/cmd"
	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/analytics"
	"github.com/your-org/argus/pkg/argus"
	"github.com/your-org/argus/pkg/auditor"
	"github.com/your-org/argus/pkg/authn"
	"github.com/your-org/argus/pkg/authz"
	"github.com/your-org/argus/pkg/authz/openfgaauthz"
	"github.com/your-org/argus/pkg/authz/openfgaschema"
	"github.com/your-org/argus/pkg/authz/openfgaserver"
	"github.com/your-org/argus/pkg/cache"
	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/gateway"
	"github.com/your-org/argus/pkg/gateway/noopgateway"
	"github.com/your-org/argus/pkg/global"
	"github.com/your-org/argus/pkg/licensing"
	"github.com/your-org/argus/pkg/licensing/nooplicensing"
	"github.com/your-org/argus/pkg/meterreporter"
	"github.com/your-org/argus/pkg/modules/cloudintegration"
	"github.com/your-org/argus/pkg/modules/cloudintegration/implcloudintegration"
	"github.com/your-org/argus/pkg/modules/dashboard"
	"github.com/your-org/argus/pkg/modules/dashboard/impldashboard"
	"github.com/your-org/argus/pkg/modules/metricreductionrule"
	"github.com/your-org/argus/pkg/modules/metricreductionrule/implmetricreductionrule"
	"github.com/your-org/argus/pkg/modules/organization"
	"github.com/your-org/argus/pkg/modules/retention"
	"github.com/your-org/argus/pkg/modules/rulestatehistory"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/modules/tag"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/query-service/app"
	"github.com/your-org/argus/pkg/queryparser"
	"github.com/your-org/argus/pkg/ruler"
	"github.com/your-org/argus/pkg/ruler/argusruler"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/subscription"
	"github.com/your-org/argus/pkg/subscription/noopsubscription"
	"github.com/your-org/argus/pkg/telemetrystore"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/dashboardtypes"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
	"github.com/your-org/argus/pkg/version"
	"github.com/your-org/argus/pkg/zeus"
	"github.com/your-org/argus/pkg/zeus/noopzeus"
)

func registerServer(parentCmd *cobra.Command, logger *slog.Logger) {
	var configFiles []string

	serverCmd := &cobra.Command{
		Use:                "server",
		Short:              "Run the Argus server",
		FParseErrWhitelist: cobra.FParseErrWhitelist{UnknownFlags: true},
		RunE: func(currCmd *cobra.Command, args []string) error {
			config, err := cmd.NewArgusConfig(currCmd.Context(), logger, configFiles)
			if err != nil {
				return err
			}

			return runServer(currCmd.Context(), config, logger)
		},
	}

	serverCmd.Flags().StringArrayVar(&configFiles, "config", nil, "path to a YAML configuration file (can be specified multiple times, later files override earlier ones)")
	parentCmd.AddCommand(serverCmd)
}

func runServer(ctx context.Context, config argus.Config, logger *slog.Logger) error {
	// print the version
	version.Info.PrettyPrint(config.Version)

	appInstance, err := argus.New(
		ctx,
		config,
		zeus.Config{},
		noopzeus.NewProviderFactory(),
		licensing.Config{},
		func(_ sqlstore.SQLStore, _ zeus.Zeus, _ organization.Getter, _ analytics.Analytics) factory.ProviderFactory[licensing.Licensing, licensing.Config] {
			return nooplicensing.NewFactory()
		},
		func(_ zeus.Zeus, _ licensing.Licensing) subscription.Subscription {
			return noopsubscription.New()
		},
		argus.NewEmailingProviderFactories(),
		argus.NewCacheProviderFactories(),
		argus.NewWebProviderFactories(config.Global),
		sqlschemaProviderFactories,
		sqlstoreProviderFactories(),
		argus.NewTelemetryStoreProviderFactories(),
		func(ctx context.Context, providerSettings factory.ProviderSettings, store authtypes.AuthNStore, licensing licensing.Licensing) (map[authtypes.AuthNProvider]authn.AuthN, error) {
			return argus.NewAuthNs(ctx, providerSettings, store, licensing, config.Global)
		},
		func(ctx context.Context, sqlstore sqlstore.SQLStore, config authz.Config, _ licensing.Licensing, _ []authz.OnBeforeRoleDelete) (factory.ProviderFactory[authz.AuthZ, authz.Config], error) {
			openfgaDataStore, err := openfgaserver.NewSQLStore(sqlstore, config)
			if err != nil {
				return nil, err
			}

			return openfgaauthz.NewProviderFactory(sqlstore, openfgaschema.NewSchema().Get(ctx), openfgaDataStore, authtypes.NewRegistry()), nil
		},
		func(store sqlstore.SQLStore, settings factory.ProviderSettings, analytics analytics.Analytics, orgGetter organization.Getter, queryParser queryparser.QueryParser, _ querier.Querier, _ licensing.Licensing, tagModule tag.Module, systemDashboardRegistry dashboardtypes.SystemDashboardRegistry) dashboard.Module {
			return impldashboard.NewModule(impldashboard.NewStore(store), settings, analytics, orgGetter, queryParser, tagModule, systemDashboardRegistry)
		},
		func(_ licensing.Licensing) factory.ProviderFactory[gateway.Gateway, gateway.Config] {
			return noopgateway.NewProviderFactory()
		},
		func(_ licensing.Licensing) factory.NamedMap[factory.ProviderFactory[auditor.Auditor, auditor.Config]] {
			return argus.NewAuditorProviderFactories()
		},
		func(_ context.Context, _ factory.ProviderSettings, _ flagger.Flagger, _ licensing.Licensing, _ telemetrystore.TelemetryStore, _ retention.Getter, _ organization.Getter, _ zeus.Zeus) (factory.NamedMap[factory.ProviderFactory[meterreporter.Reporter, meterreporter.Config]], string) {
			return argus.NewMeterReporterProviderFactories(), "noop"
		},
		func(ps factory.ProviderSettings, q querier.Querier, a analytics.Analytics) querier.Handler {
			return querier.NewHandler(ps, q, a)
		},
		func(_ sqlstore.SQLStore, _ dashboard.Module, _ global.Global, _ zeus.Zeus, _ gateway.Gateway, _ licensing.Licensing, _ serviceaccount.Module, _ cloudintegration.Config) (cloudintegration.Module, error) {
			return implcloudintegration.NewModule(), nil
		},
		func(_ sqlstore.SQLStore, _ telemetrystore.TelemetryStore, _ dashboard.Module, _ queryparser.QueryParser, _ licensing.Licensing, _ flagger.Flagger, _ telemetrytypes.MetadataStore, _ factory.ProviderSettings, _ int) metricreductionrule.Module {
			return implmetricreductionrule.NewModule()
		},
		func(c cache.Cache, am alertmanager.Alertmanager, ss sqlstore.SQLStore, ts telemetrystore.TelemetryStore, ms telemetrytypes.MetadataStore, p prometheus.Prometheus, og organization.Getter, rsh rulestatehistory.Module, q querier.Querier, qp queryparser.QueryParser) factory.NamedMap[factory.ProviderFactory[ruler.Ruler, ruler.Config]] {
			return factory.MustNewNamedMap(argusruler.NewFactory(c, am, ss, ts, ms, p, og, rsh, q, qp, nil, nil))
		},
	)
	if err != nil {
		logger.ErrorContext(ctx, "failed to create Argus", errors.Attr(err))
		return err
	}

	server, err := app.NewServer(config, appInstance)
	if err != nil {
		logger.ErrorContext(ctx, "failed to create server", errors.Attr(err))
		return err
	}

	if err := server.Start(ctx); err != nil {
		logger.ErrorContext(ctx, "failed to start server", errors.Attr(err))
		return err
	}

	appInstance.Start(ctx)

	if err := appInstance.Wait(ctx); err != nil {
		logger.ErrorContext(ctx, "failed to start Argus", errors.Attr(err))
		return err
	}

	err = server.Stop(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "failed to stop server", errors.Attr(err))
		return err
	}

	err = appInstance.Stop(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "failed to stop Argus", errors.Attr(err))
		return err
	}

	return nil
}
