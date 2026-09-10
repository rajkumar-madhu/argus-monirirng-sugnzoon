package argus

import (
	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/alertmanager/argusalertmanager"
	"github.com/your-org/argus/pkg/alertmanager/nfmanager"
	"github.com/your-org/argus/pkg/alertmanager/nfmanager/rulebasednotification"
	"github.com/your-org/argus/pkg/analytics"
	"github.com/your-org/argus/pkg/analytics/noopanalytics"
	"github.com/your-org/argus/pkg/analytics/segmentanalytics"
	"github.com/your-org/argus/pkg/apiserver"
	"github.com/your-org/argus/pkg/apiserver/argusapiserver"
	"github.com/your-org/argus/pkg/auditor"
	"github.com/your-org/argus/pkg/auditor/noopauditor"
	"github.com/your-org/argus/pkg/authz"
	"github.com/your-org/argus/pkg/cache"
	"github.com/your-org/argus/pkg/cache/memorycache"
	"github.com/your-org/argus/pkg/cache/rediscache"
	"github.com/your-org/argus/pkg/emailing"
	"github.com/your-org/argus/pkg/emailing/noopemailing"
	"github.com/your-org/argus/pkg/emailing/smtpemailing"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/flagger/configflagger"
	"github.com/your-org/argus/pkg/gateway"
	"github.com/your-org/argus/pkg/global"
	"github.com/your-org/argus/pkg/global/argusglobal"
	"github.com/your-org/argus/pkg/identn"
	"github.com/your-org/argus/pkg/identn/apikeyidentn"
	"github.com/your-org/argus/pkg/identn/impersonationidentn"
	"github.com/your-org/argus/pkg/identn/tokenizeridentn"
	"github.com/your-org/argus/pkg/meterreporter"
	"github.com/your-org/argus/pkg/meterreporter/noopmeterreporter"
	"github.com/your-org/argus/pkg/modules/authdomain/implauthdomain"
	"github.com/your-org/argus/pkg/modules/organization"
	"github.com/your-org/argus/pkg/modules/organization/implorganization"
	"github.com/your-org/argus/pkg/modules/preference/implpreference"
	"github.com/your-org/argus/pkg/modules/promote/implpromote"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/modules/session/implsession"
	"github.com/your-org/argus/pkg/modules/tag"
	"github.com/your-org/argus/pkg/modules/user"
	"github.com/your-org/argus/pkg/modules/user/impluser"
	"github.com/your-org/argus/pkg/pprof"
	"github.com/your-org/argus/pkg/pprof/httppprof"
	"github.com/your-org/argus/pkg/pprof/nooppprof"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/prometheus/clickhouseprometheus"
	"github.com/your-org/argus/pkg/prometheus/clickhouseprometheusv2"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/querier/argusquerier"
	"github.com/your-org/argus/pkg/sharder"
	"github.com/your-org/argus/pkg/sharder/noopsharder"
	"github.com/your-org/argus/pkg/sharder/singlesharder"
	"github.com/your-org/argus/pkg/sqlmigration"
	"github.com/your-org/argus/pkg/sqlschema"
	"github.com/your-org/argus/pkg/sqlschema/sqlitesqlschema"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/sqlstore/sqlitesqlstore"
	"github.com/your-org/argus/pkg/sqlstore/sqlstorehook"
	"github.com/your-org/argus/pkg/statsreporter"
	"github.com/your-org/argus/pkg/statsreporter/analyticsstatsreporter"
	"github.com/your-org/argus/pkg/statsreporter/noopstatsreporter"
	"github.com/your-org/argus/pkg/telemetrystore"
	"github.com/your-org/argus/pkg/telemetrystore/clickhousetelemetrystore"
	"github.com/your-org/argus/pkg/telemetrystore/telemetrystorehook"
	"github.com/your-org/argus/pkg/tokenizer"
	"github.com/your-org/argus/pkg/tokenizer/jwttokenizer"
	"github.com/your-org/argus/pkg/tokenizer/opaquetokenizer"
	"github.com/your-org/argus/pkg/tokenizer/tokenizerstore/sqltokenizerstore"
	"github.com/your-org/argus/pkg/types/alertmanagertypes"
	"github.com/your-org/argus/pkg/types/dashboardtypes"
	"github.com/your-org/argus/pkg/types/featuretypes"
	qbtypes "github.com/your-org/argus/pkg/types/querybuildertypes/querybuildertypesv5"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
	"github.com/your-org/argus/pkg/version"
	"github.com/your-org/argus/pkg/web"
	"github.com/your-org/argus/pkg/web/noopweb"
	"github.com/your-org/argus/pkg/web/routerweb"
)

func NewAnalyticsProviderFactories() factory.NamedMap[factory.ProviderFactory[analytics.Analytics, analytics.Config]] {
	return factory.MustNewNamedMap(
		noopanalytics.NewFactory(),
		segmentanalytics.NewFactory(),
	)
}

func NewCacheProviderFactories() factory.NamedMap[factory.ProviderFactory[cache.Cache, cache.Config]] {
	return factory.MustNewNamedMap(
		memorycache.NewFactory(),
		rediscache.NewFactory(),
	)
}

func NewWebProviderFactories(globalConfig global.Config) factory.NamedMap[factory.ProviderFactory[web.Web, web.Config]] {
	return factory.MustNewNamedMap(
		routerweb.NewFactory(globalConfig),
		noopweb.NewFactory(),
	)
}

func NewPProfProviderFactories() factory.NamedMap[factory.ProviderFactory[pprof.PProf, pprof.Config]] {
	return factory.MustNewNamedMap(
		httppprof.NewFactory(),
		nooppprof.NewFactory(),
	)
}

func NewSQLStoreProviderFactories() factory.NamedMap[factory.ProviderFactory[sqlstore.SQLStore, sqlstore.Config]] {
	return factory.MustNewNamedMap(
		sqlitesqlstore.NewFactory(sqlstorehook.NewLoggingFactory(), sqlstorehook.NewInstrumentationFactory()),
	)
}

func NewSQLSchemaProviderFactories(sqlstore sqlstore.SQLStore) factory.NamedMap[factory.ProviderFactory[sqlschema.SQLSchema, sqlschema.Config]] {
	return factory.MustNewNamedMap(
		sqlitesqlschema.NewFactory(sqlstore),
	)
}

func NewSQLMigrationProviderFactories(
	sqlstore sqlstore.SQLStore,
	sqlschema sqlschema.SQLSchema,
	telemetryStore telemetrystore.TelemetryStore,
	providerSettings factory.ProviderSettings,
	dashboardStore dashboardtypes.Store,
	tagModule tag.Module,
) factory.NamedMap[factory.ProviderFactory[sqlmigration.SQLMigration, sqlmigration.Config]] {
	return factory.MustNewNamedMap(
		sqlmigration.NewAddDataMigrationsFactory(),
		sqlmigration.NewAddOrganizationFactory(),
		sqlmigration.NewAddPreferencesFactory(),
		sqlmigration.NewAddDashboardsFactory(),
		sqlmigration.NewAddSavedViewsFactory(),
		sqlmigration.NewAddAgentsFactory(),
		sqlmigration.NewAddPipelinesFactory(),
		sqlmigration.NewAddIntegrationsFactory(),
		sqlmigration.NewAddLicensesFactory(),
		sqlmigration.NewAddPatsFactory(),
		sqlmigration.NewModifyDatetimeFactory(),
		sqlmigration.NewModifyOrgDomainFactory(),
		sqlmigration.NewUpdateOrganizationFactory(sqlstore),
		sqlmigration.NewAddAlertmanagerFactory(sqlstore),
		sqlmigration.NewUpdateDashboardAndSavedViewsFactory(sqlstore),
		sqlmigration.NewUpdatePatAndOrgDomainsFactory(sqlstore),
		sqlmigration.NewUpdatePipelines(sqlstore),
		sqlmigration.NewDropLicensesSitesFactory(sqlstore),
		sqlmigration.NewUpdateInvitesFactory(sqlstore),
		sqlmigration.NewUpdatePatFactory(sqlstore),
		sqlmigration.NewUpdateAlertmanagerFactory(sqlstore),
		sqlmigration.NewUpdatePreferencesFactory(sqlstore),
		sqlmigration.NewUpdateApdexTtlFactory(sqlstore),
		sqlmigration.NewUpdateResetPasswordFactory(sqlstore),
		sqlmigration.NewUpdateRulesFactory(sqlstore),
		sqlmigration.NewAddVirtualFieldsFactory(),
		sqlmigration.NewUpdateIntegrationsFactory(sqlstore),
		sqlmigration.NewUpdateOrganizationsFactory(sqlstore),
		sqlmigration.NewDropGroupsFactory(sqlstore),
		sqlmigration.NewCreateQuickFiltersFactory(sqlstore),
		sqlmigration.NewUpdateQuickFiltersFactory(sqlstore),
		sqlmigration.NewAuthRefactorFactory(sqlstore),
		sqlmigration.NewUpdateLicenseFactory(sqlstore),
		sqlmigration.NewMigratePATToFactorAPIKey(sqlstore),
		sqlmigration.NewUpdateApiMonitoringFiltersFactory(sqlstore),
		sqlmigration.NewAddKeyOrganizationFactory(sqlstore),
		sqlmigration.NewAddTraceFunnelsFactory(sqlstore),
		sqlmigration.NewUpdateDashboardFactory(sqlstore),
		sqlmigration.NewDropFeatureSetFactory(),
		sqlmigration.NewDropDeprecatedTablesFactory(),
		sqlmigration.NewUpdateAgentsFactory(sqlstore),
		sqlmigration.NewUpdateUsersFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateUserInviteFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateOrgDomainFactory(sqlstore, sqlschema),
		sqlmigration.NewAddFactorIndexesFactory(sqlstore, sqlschema),
		sqlmigration.NewQueryBuilderV5MigrationFactory(sqlstore, telemetryStore),
		sqlmigration.NewAddMeterQuickFiltersFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateTTLSettingForCustomRetentionFactory(sqlstore, sqlschema),
		sqlmigration.NewAddRoutePolicyFactory(sqlstore, sqlschema),
		sqlmigration.NewAddAuthTokenFactory(sqlstore, sqlschema),
		sqlmigration.NewAddAuthzFactory(sqlstore, sqlschema),
		sqlmigration.NewAddPublicDashboardsFactory(sqlstore, sqlschema),
		sqlmigration.NewAddRoleFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateAuthzFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateUserPreferenceFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateOrgPreferenceFactory(sqlstore, sqlschema),
		sqlmigration.NewRenameOrgDomainsFactory(sqlstore, sqlschema),
		sqlmigration.NewAddResetPasswordTokenExpiryFactory(sqlstore, sqlschema),
		sqlmigration.NewAddManagedRolesFactory(sqlstore, sqlschema),
		sqlmigration.NewAddAuthzIndexFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateRbacToAuthzFactory(sqlstore),
		sqlmigration.NewMigratePublicDashboardsFactory(sqlstore),
		sqlmigration.NewAddAnonymousPublicDashboardTransactionFactory(sqlstore),
		sqlmigration.NewAddRootUserFactory(sqlstore, sqlschema),
		sqlmigration.NewAddUserEmailOrgIDIndexFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateRulesV4ToV5Factory(sqlstore, telemetryStore),
		sqlmigration.NewAddStatusUserFactory(sqlstore, sqlschema),
		sqlmigration.NewDeprecateUserInviteFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdateCloudIntegrationUniqueIndexFactory(sqlstore, sqlschema),
		sqlmigration.NewUpdatePlannedMaintenanceRuleFactory(sqlstore, sqlschema),
		sqlmigration.NewAddUserRoleFactory(sqlstore, sqlschema),
		sqlmigration.NewDropUserRoleColumnFactory(sqlstore, sqlschema),
		sqlmigration.NewAddServiceAccountFactory(sqlstore, sqlschema),
		sqlmigration.NewDeprecateAPIKeyFactory(sqlstore, sqlschema),
		sqlmigration.NewServiceAccountAuthzactory(sqlstore),
		sqlmigration.NewDropUserDeletedAtFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateAWSAllRegionsFactory(sqlstore),
		sqlmigration.NewAddServiceAccountManagedRoleTransactionsFactory(sqlstore),
		sqlmigration.NewAddSpanMapperFactory(sqlstore, sqlschema),
		sqlmigration.NewAddLLMPricingRulesFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateMetaresourcesTuplesFactory(sqlstore),
		sqlmigration.NewAddTagsFactory(sqlstore, sqlschema),
		sqlmigration.NewAddRoleCRUDTuplesFactory(sqlstore),
		sqlmigration.NewAddIntegrationDashboardFactory(sqlstore, sqlschema),
		sqlmigration.NewAddSourceToDashboardFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateCloudIntegrationDashboardsFactory(sqlstore),
		sqlmigration.NewAddScopeToPlannedMaintenanceFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateInstalledIntegrationDashboardsFactory(sqlstore),
		sqlmigration.NewAddDashboardNameFactory(sqlstore, sqlschema),
		sqlmigration.NewFixChangelogOperationTypeFactory(sqlstore, sqlschema),
		sqlmigration.NewCloudIntegrationRemoveCascadeDeleteFactory(sqlschema),
		sqlmigration.NewAddUserDashboardPreferenceFactory(sqlstore, sqlschema),
		sqlmigration.NewRecreateUserDashboardPreferenceFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateRecurrenceBoundsFactory(sqlstore),
		sqlmigration.NewAddDashboardViewFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateSSORoleMappingNamesFactory(sqlstore),
		sqlmigration.NewAddMetricReductionRulesFactory(sqlstore, sqlschema),
		sqlmigration.NewRemoveOrganizationTuplesFactory(sqlstore),
		sqlmigration.NewAddRoleTransactionGroupsFactory(sqlstore, sqlschema),
		sqlmigration.NewAddTagUniqueIndexFactory(sqlstore, sqlschema),
		sqlmigration.NewAddTelemetryTuplesFactory(sqlstore),
		sqlmigration.NewAddTagRelationRankFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateDashboardsV1ToV2Factory(sqlstore, sqlschema, dashboardStore, tagModule),
		sqlmigration.NewFillDashboardMeterSourceFactory(sqlstore, dashboardStore),
		sqlmigration.NewUpdateRoleTransactionGroupsFactory(),
		sqlmigration.NewFillDashboardSpecCollectionsFactory(sqlstore, dashboardStore),
		sqlmigration.NewScrubEmailChannelTransportFactory(sqlstore),
		sqlmigration.NewAddDashboardTuplesFactory(sqlstore),
		sqlmigration.NewRestructureSavedViewSpecFactory(sqlstore, sqlschema),
		sqlmigration.NewAddSavedViewTuplesFactory(sqlstore),
		sqlmigration.NewFixSavedViewSelectedFieldsFactory(sqlstore),
		sqlmigration.NewBackfillSavedViewRequestTypeFactory(sqlstore),
		sqlmigration.NewRestructureAuthDomainConfigFactory(sqlstore),
		sqlmigration.NewFixSavedViewSelectFieldsFactory(sqlstore),
		sqlmigration.NewDeleteOrphanUserRolesFactory(),
		sqlmigration.NewMigrateLambdaDashboardsFactory(),
		sqlmigration.NewAddAuthDomainTuplesFactory(sqlstore),
		sqlmigration.NewAddDeploymentHostTuplesFactory(sqlstore),
		sqlmigration.NewAddSystemDashboardFactory(sqlstore, sqlschema),
		sqlmigration.NewAddLicenseTuplesFactory(sqlstore),
		sqlmigration.NewAddChannelDisplayNameFactory(sqlstore, sqlschema),
		sqlmigration.NewMigrateQuickFiltersFactory(sqlstore),
		sqlmigration.NewAddQuickFilterTuplesFactory(sqlstore),
		sqlmigration.NewAddIngestionTuplesFactory(sqlstore),
		sqlmigration.NewAddSubscriptionTuplesFactory(sqlstore),
		sqlmigration.NewNormalizeQuickFilterFieldsFactory(sqlstore),
	)
}

func NewTelemetryStoreProviderFactories() factory.NamedMap[factory.ProviderFactory[telemetrystore.TelemetryStore, telemetrystore.Config]] {
	return factory.MustNewNamedMap(
		clickhousetelemetrystore.NewFactory(
			telemetrystorehook.NewLoggingFactory(),
			// adding instrumentation factory before settings as we are starting the query span here
			telemetrystorehook.NewInstrumentationFactory(),
			telemetrystorehook.NewSettingsFactory(),
		),
	)
}

func NewPrometheusProviderFactories(telemetryStore telemetrystore.TelemetryStore) factory.NamedMap[factory.ProviderFactory[prometheus.Prometheus, prometheus.Config]] {
	return factory.MustNewNamedMap(
		clickhouseprometheus.NewFactory(telemetryStore),
		clickhouseprometheusv2.NewFactory(telemetryStore),
	)
}

func NewNotificationManagerProviderFactories(routeStore alertmanagertypes.RouteStore) factory.NamedMap[factory.ProviderFactory[nfmanager.NotificationManager, nfmanager.Config]] {
	return factory.MustNewNamedMap(
		rulebasednotification.NewFactory(routeStore),
	)
}

func NewAlertmanagerProviderFactories(
	sqlstore sqlstore.SQLStore,
	orgGetter organization.Getter,
	nfManager nfmanager.NotificationManager,
	maintenanceStore alertmanagertypes.MaintenanceStore,
) factory.NamedMap[factory.ProviderFactory[alertmanager.Alertmanager, alertmanager.Config]] {
	return factory.MustNewNamedMap(
		argusalertmanager.NewFactory(sqlstore, orgGetter, nfManager, maintenanceStore),
	)
}

func NewEmailingProviderFactories() factory.NamedMap[factory.ProviderFactory[emailing.Emailing, emailing.Config]] {
	return factory.MustNewNamedMap(
		noopemailing.NewFactory(),
		smtpemailing.NewFactory(),
	)
}

func NewSharderProviderFactories() factory.NamedMap[factory.ProviderFactory[sharder.Sharder, sharder.Config]] {
	return factory.MustNewNamedMap(
		singlesharder.NewFactory(),
		noopsharder.NewFactory(),
	)
}

func NewStatsReporterProviderFactories(aggregator statsreporter.Aggregator, orgGetter organization.Getter, userGetter user.Getter, tokenizer tokenizer.Tokenizer, build version.Build, analyticsConfig analytics.Config) factory.NamedMap[factory.ProviderFactory[statsreporter.StatsReporter, statsreporter.Config]] {
	return factory.MustNewNamedMap(
		analyticsstatsreporter.NewFactory(aggregator, orgGetter, userGetter, tokenizer, build, analyticsConfig),
		noopstatsreporter.NewFactory(),
	)
}

func NewQuerierProviderFactories(telemetryStore telemetrystore.TelemetryStore, prometheus prometheus.Prometheus, promV2 prometheus.Prometheus, metadataStore telemetrytypes.MetadataStore, traceStmtBuilder qbtypes.StatementBuilder[qbtypes.TraceAggregation], aiTraceStmtBuilder qbtypes.StatementBuilder[qbtypes.TraceAggregation], logStmtBuilder qbtypes.StatementBuilder[qbtypes.LogAggregation], auditStmtBuilder qbtypes.StatementBuilder[qbtypes.LogAggregation], metricStmtBuilder qbtypes.StatementBuilder[qbtypes.MetricAggregation], meterStmtBuilder qbtypes.StatementBuilder[qbtypes.MetricAggregation], traceOperatorStmtBuilder qbtypes.TraceOperatorStatementBuilder, bucketCache querier.BucketCache, flagger flagger.Flagger) factory.NamedMap[factory.ProviderFactory[querier.Querier, querier.Config]] {
	return factory.MustNewNamedMap(
		argusquerier.NewFactory(telemetryStore, prometheus, promV2, metadataStore, traceStmtBuilder, aiTraceStmtBuilder, logStmtBuilder, auditStmtBuilder, metricStmtBuilder, meterStmtBuilder, traceOperatorStmtBuilder, bucketCache, flagger),
	)
}

func NewAPIServerProviderFactories(orgGetter organization.Getter, authz authz.AuthZ, modules Modules, handlers Handlers, globalConfig global.Config, gatewayService gateway.Gateway, identNResolver identn.IdentNResolver, sharder sharder.Sharder, auditor auditor.Auditor, web web.Web) factory.NamedMap[factory.ProviderFactory[apiserver.APIServer, apiserver.Config]] {
	return factory.MustNewNamedMap(
		argusapiserver.NewFactory(
			orgGetter,
			authz,
			implorganization.NewHandler(modules.OrgGetter, modules.OrgSetter),
			impluser.NewHandler(modules.UserSetter, modules.UserGetter),
			implsession.NewHandler(modules.Session, globalConfig),
			implauthdomain.NewHandler(modules.AuthDomain),
			modules.AuthDomain,
			implpreference.NewHandler(modules.Preference),
			handlers.Global,
			implpromote.NewHandler(modules.Promote),
			handlers.FlaggerHandler,
			modules.Dashboard,
			handlers.Dashboard,
			handlers.MetricsExplorer,
			handlers.MetricReductionRule,
			handlers.InfraMonitoring,
			handlers.GatewayHandler,
			gatewayService,
			handlers.Fields,
			handlers.AIObservability,
			handlers.AuthzHandler,
			handlers.RawDataExport,
			handlers.ZeusHandler,
			handlers.LicensingHandler,
			handlers.SubscriptionHandler,
			handlers.QuerierHandler,
			handlers.ServiceAccountHandler,
			modules.ServiceAccountGetter,
			handlers.RegistryHandler,
			handlers.CloudIntegrationHandler,
			handlers.RuleStateHistory,
			handlers.SpanMapperHandler,
			handlers.AlertmanagerHandler,
			handlers.PrometheusHandler,
			handlers.LLMPricingRuleHandler,
			handlers.TraceDetail,
			handlers.RulerHandler,
			handlers.StatsHandler,
			handlers.SavedView,
			globalConfig,
			identNResolver,
			sharder,
			auditor,
			web,
			modules.QuickFilter,
			handlers.QuickFilter,
		),
	)
}

func NewTokenizerProviderFactories(cache cache.Cache, sqlstore sqlstore.SQLStore, orgGetter organization.Getter) factory.NamedMap[factory.ProviderFactory[tokenizer.Tokenizer, tokenizer.Config]] {
	tokenStore := sqltokenizerstore.NewStore(sqlstore)
	return factory.MustNewNamedMap(
		opaquetokenizer.NewFactory(cache, tokenStore, orgGetter),
		jwttokenizer.NewFactory(cache, tokenStore),
	)
}

func NewIdentNProviderFactories(tokenizer tokenizer.Tokenizer, serviceAccount serviceaccount.Module, orgGetter organization.Getter, userGetter user.Getter, userConfig user.Config) factory.NamedMap[factory.ProviderFactory[identn.IdentN, identn.Config]] {
	return factory.MustNewNamedMap(
		impersonationidentn.NewFactory(orgGetter, userGetter, userConfig),
		tokenizeridentn.NewFactory(tokenizer),
		apikeyidentn.NewFactory(serviceAccount),
	)
}

func NewGlobalProviderFactories(identNConfig identn.Config) factory.NamedMap[factory.ProviderFactory[global.Global, global.Config]] {
	return factory.MustNewNamedMap(
		argusglobal.NewFactory(identNConfig),
	)
}

func NewAuditorProviderFactories() factory.NamedMap[factory.ProviderFactory[auditor.Auditor, auditor.Config]] {
	return factory.MustNewNamedMap(
		noopauditor.NewFactory(),
	)
}

func NewMeterReporterProviderFactories() factory.NamedMap[factory.ProviderFactory[meterreporter.Reporter, meterreporter.Config]] {
	return factory.MustNewNamedMap(
		noopmeterreporter.NewFactory(),
	)
}

func NewFlaggerProviderFactories(registry featuretypes.Registry) factory.NamedMap[factory.ProviderFactory[flagger.FlaggerProvider, flagger.Config]] {
	return factory.MustNewNamedMap(
		configflagger.NewFactory(registry),
	)
}
