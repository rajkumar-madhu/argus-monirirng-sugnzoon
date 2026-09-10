package argusapiserver

import (
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/apiserver"
	"github.com/your-org/argus/pkg/auditor"
	"github.com/your-org/argus/pkg/authz"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/gateway"
	"github.com/your-org/argus/pkg/global"
	"github.com/your-org/argus/pkg/http/handler"
	"github.com/your-org/argus/pkg/http/middleware"
	httpserver "github.com/your-org/argus/pkg/http/server"
	"github.com/your-org/argus/pkg/identn"
	"github.com/your-org/argus/pkg/licensing"
	"github.com/your-org/argus/pkg/modules/aiobservability"
	"github.com/your-org/argus/pkg/modules/authdomain"
	"github.com/your-org/argus/pkg/modules/cloudintegration"
	"github.com/your-org/argus/pkg/modules/dashboard"
	"github.com/your-org/argus/pkg/modules/fields"
	"github.com/your-org/argus/pkg/modules/inframonitoring"
	"github.com/your-org/argus/pkg/modules/llmpricingrule"
	"github.com/your-org/argus/pkg/modules/metricreductionrule"
	"github.com/your-org/argus/pkg/modules/metricsexplorer"
	"github.com/your-org/argus/pkg/modules/organization"
	"github.com/your-org/argus/pkg/modules/preference"
	"github.com/your-org/argus/pkg/modules/promote"
	"github.com/your-org/argus/pkg/modules/quickfilter"
	"github.com/your-org/argus/pkg/modules/rawdataexport"
	"github.com/your-org/argus/pkg/modules/rulestatehistory"
	"github.com/your-org/argus/pkg/modules/savedview"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/modules/session"
	"github.com/your-org/argus/pkg/modules/spanmapper"
	"github.com/your-org/argus/pkg/modules/tracedetail"
	"github.com/your-org/argus/pkg/modules/user"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/ruler"
	"github.com/your-org/argus/pkg/sharder"
	"github.com/your-org/argus/pkg/statsreporter"
	"github.com/your-org/argus/pkg/subscription"
	"github.com/your-org/argus/pkg/types"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/web"
	"github.com/your-org/argus/pkg/zeus"
)

type provider struct {
	globalConfig               global.Config
	web                        web.Web
	router                     *mux.Router
	httpServer                 *httpserver.Server
	healthyC                   chan struct{}
	authzMiddleware            *middleware.AuthZ
	authzService               authz.AuthZ
	orgHandler                 organization.Handler
	userHandler                user.Handler
	sessionHandler             session.Handler
	authDomainHandler          authdomain.Handler
	authDomainModule           authdomain.Module
	preferenceHandler          preference.Handler
	globalHandler              global.Handler
	promoteHandler             promote.Handler
	flaggerHandler             flagger.Handler
	dashboardModule            dashboard.Module
	dashboardHandler           dashboard.Handler
	metricsExplorerHandler     metricsexplorer.Handler
	metricReductionRuleHandler metricreductionrule.Handler
	infraMonitoringHandler     inframonitoring.Handler
	gatewayHandler             gateway.Handler
	gatewayService             gateway.Gateway
	fieldsHandler              fields.Handler
	aiObservabilityHandler     aiobservability.Handler
	authzHandler               authz.Handler
	rawDataExportHandler       rawdataexport.Handler
	zeusHandler                zeus.Handler
	licensingHandler           licensing.Handler
	subscriptionHandler        subscription.Handler
	querierHandler             querier.Handler
	serviceAccountHandler      serviceaccount.Handler
	serviceAccountGetter       serviceaccount.Getter
	factoryHandler             factory.Handler
	cloudIntegrationHandler    cloudintegration.Handler
	ruleStateHistoryHandler    rulestatehistory.Handler
	spanMapperHandler          spanmapper.Handler
	alertmanagerHandler        alertmanager.Handler
	prometheusHandler          prometheus.Handler
	traceDetailHandler         tracedetail.Handler
	rulerHandler               ruler.Handler
	llmPricingRuleHandler      llmpricingrule.Handler
	statsHandler               statsreporter.Handler
	savedViewHandler           savedview.Handler
	quickFilterModule          quickfilter.Module
	quickFilterHandler         quickfilter.Handler
}

func NewFactory(
	orgGetter organization.Getter,
	authzService authz.AuthZ,
	orgHandler organization.Handler,
	userHandler user.Handler,
	sessionHandler session.Handler,
	authDomainHandler authdomain.Handler,
	authDomainModule authdomain.Module,
	preferenceHandler preference.Handler,
	globalHandler global.Handler,
	promoteHandler promote.Handler,
	flaggerHandler flagger.Handler,
	dashboardModule dashboard.Module,
	dashboardHandler dashboard.Handler,
	metricsExplorerHandler metricsexplorer.Handler,
	metricReductionRuleHandler metricreductionrule.Handler,
	infraMonitoringHandler inframonitoring.Handler,
	gatewayHandler gateway.Handler,
	gatewayService gateway.Gateway,
	fieldsHandler fields.Handler,
	aiObservabilityHandler aiobservability.Handler,
	authzHandler authz.Handler,
	rawDataExportHandler rawdataexport.Handler,
	zeusHandler zeus.Handler,
	licensingHandler licensing.Handler,
	subscriptionHandler subscription.Handler,
	querierHandler querier.Handler,
	serviceAccountHandler serviceaccount.Handler,
	serviceAccountGetter serviceaccount.Getter,
	factoryHandler factory.Handler,
	cloudIntegrationHandler cloudintegration.Handler,
	ruleStateHistoryHandler rulestatehistory.Handler,
	spanMapperHandler spanmapper.Handler,
	alertmanagerHandler alertmanager.Handler,
	prometheusHandler prometheus.Handler,
	llmPricingRuleHandler llmpricingrule.Handler,
	traceDetailHandler tracedetail.Handler,
	rulerHandler ruler.Handler,
	statsHandler statsreporter.Handler,
	savedViewHandler savedview.Handler,
	globalConfig global.Config,
	identNResolver identn.IdentNResolver,
	sharder sharder.Sharder,
	auditor auditor.Auditor,
	web web.Web,
	quickFilterModule quickfilter.Module,
	quickFilterHandler quickfilter.Handler,
) factory.ProviderFactory[apiserver.APIServer, apiserver.Config] {
	return factory.NewProviderFactory(factory.MustNewName("argus"), func(ctx context.Context, providerSettings factory.ProviderSettings, config apiserver.Config) (apiserver.APIServer, error) {
		return newProvider(
			ctx,
			providerSettings,
			config,
			orgGetter,
			authzService,
			orgHandler,
			userHandler,
			sessionHandler,
			authDomainHandler,
			authDomainModule,
			preferenceHandler,
			globalHandler,
			promoteHandler,
			flaggerHandler,
			dashboardModule,
			dashboardHandler,
			metricsExplorerHandler,
			metricReductionRuleHandler,
			infraMonitoringHandler,
			gatewayHandler,
			gatewayService,
			fieldsHandler,
			aiObservabilityHandler,
			authzHandler,
			rawDataExportHandler,
			zeusHandler,
			licensingHandler,
			subscriptionHandler,
			querierHandler,
			serviceAccountHandler,
			serviceAccountGetter,
			factoryHandler,
			cloudIntegrationHandler,
			ruleStateHistoryHandler,
			spanMapperHandler,
			alertmanagerHandler,
			prometheusHandler,
			llmPricingRuleHandler,
			traceDetailHandler,
			rulerHandler,
			statsHandler,
			savedViewHandler,
			globalConfig,
			identNResolver,
			sharder,
			auditor,
			web,
			quickFilterModule,
			quickFilterHandler,
		)
	})
}

func newProvider(
	_ context.Context,
	providerSettings factory.ProviderSettings,
	config apiserver.Config,
	orgGetter organization.Getter,
	authzService authz.AuthZ,
	orgHandler organization.Handler,
	userHandler user.Handler,
	sessionHandler session.Handler,
	authDomainHandler authdomain.Handler,
	authDomainModule authdomain.Module,
	preferenceHandler preference.Handler,
	globalHandler global.Handler,
	promoteHandler promote.Handler,
	flaggerHandler flagger.Handler,
	dashboardModule dashboard.Module,
	dashboardHandler dashboard.Handler,
	metricsExplorerHandler metricsexplorer.Handler,
	metricReductionRuleHandler metricreductionrule.Handler,
	infraMonitoringHandler inframonitoring.Handler,
	gatewayHandler gateway.Handler,
	gatewayService gateway.Gateway,
	fieldsHandler fields.Handler,
	aiObservabilityHandler aiobservability.Handler,
	authzHandler authz.Handler,
	rawDataExportHandler rawdataexport.Handler,
	zeusHandler zeus.Handler,
	licensingHandler licensing.Handler,
	subscriptionHandler subscription.Handler,
	querierHandler querier.Handler,
	serviceAccountHandler serviceaccount.Handler,
	serviceAccountGetter serviceaccount.Getter,
	factoryHandler factory.Handler,
	cloudIntegrationHandler cloudintegration.Handler,
	ruleStateHistoryHandler rulestatehistory.Handler,
	spanMapperHandler spanmapper.Handler,
	alertmanagerHandler alertmanager.Handler,
	prometheusHandler prometheus.Handler,
	llmPricingRuleHandler llmpricingrule.Handler,
	traceDetailHandler tracedetail.Handler,
	rulerHandler ruler.Handler,
	statsHandler statsreporter.Handler,
	savedViewHandler savedview.Handler,
	globalConfig global.Config,
	identNResolver identn.IdentNResolver,
	sharder sharder.Sharder,
	auditor auditor.Auditor,
	web web.Web,
	quickFilterModule quickfilter.Module,
	quickFilterHandler quickfilter.Handler,
) (apiserver.APIServer, error) {
	settings := factory.NewScopedProviderSettings(providerSettings, "github.com/your-org/argus/pkg/apiserver/argusapiserver")
	router := mux.NewRouter().UseEncodedPath()

	provider := &provider{
		globalConfig:               globalConfig,
		web:                        web,
		router:                     router,
		healthyC:                   make(chan struct{}),
		orgHandler:                 orgHandler,
		userHandler:                userHandler,
		authzService:               authzService,
		sessionHandler:             sessionHandler,
		authDomainHandler:          authDomainHandler,
		authDomainModule:           authDomainModule,
		preferenceHandler:          preferenceHandler,
		globalHandler:              globalHandler,
		promoteHandler:             promoteHandler,
		flaggerHandler:             flaggerHandler,
		dashboardModule:            dashboardModule,
		dashboardHandler:           dashboardHandler,
		metricsExplorerHandler:     metricsExplorerHandler,
		metricReductionRuleHandler: metricReductionRuleHandler,
		infraMonitoringHandler:     infraMonitoringHandler,
		gatewayHandler:             gatewayHandler,
		gatewayService:             gatewayService,
		fieldsHandler:              fieldsHandler,
		aiObservabilityHandler:     aiObservabilityHandler,
		authzHandler:               authzHandler,
		rawDataExportHandler:       rawDataExportHandler,
		zeusHandler:                zeusHandler,
		licensingHandler:           licensingHandler,
		subscriptionHandler:        subscriptionHandler,
		querierHandler:             querierHandler,
		serviceAccountHandler:      serviceAccountHandler,
		serviceAccountGetter:       serviceAccountGetter,
		factoryHandler:             factoryHandler,
		cloudIntegrationHandler:    cloudIntegrationHandler,
		ruleStateHistoryHandler:    ruleStateHistoryHandler,
		spanMapperHandler:          spanMapperHandler,
		alertmanagerHandler:        alertmanagerHandler,
		prometheusHandler:          prometheusHandler,
		traceDetailHandler:         traceDetailHandler,
		rulerHandler:               rulerHandler,
		llmPricingRuleHandler:      llmPricingRuleHandler,
		statsHandler:               statsHandler,
		savedViewHandler:           savedViewHandler,
		quickFilterModule:          quickFilterModule,
		quickFilterHandler:         quickFilterHandler,
	}

	provider.authzMiddleware = middleware.NewAuthZ(settings.Logger(), orgGetter, authzService)

	router.Use(middleware.NewRecovery(settings.Logger()).Wrap)
	router.Use(middleware.NewOtel("apiserver", providerSettings.MeterProvider, providerSettings.TracerProvider).Wrap)
	router.Use(middleware.NewIdentN(identNResolver, sharder, settings.Logger()).Wrap)
	router.Use(middleware.NewTimeout(settings.Logger(),
		config.Timeout.ExcludedRoutes,
		config.Timeout.Default,
		config.Timeout.Max,
	).Wrap)
	router.Use(middleware.NewResource(settings.Logger()).Wrap)
	router.Use(middleware.NewAudit(settings.Logger(), config.Logging.ExcludedRoutes, auditor).Wrap)
	router.Use(middleware.NewComment().Wrap)

	if err := provider.AddToRouter(router); err != nil {
		return nil, err
	}

	httpHandler := middleware.NewCors().Wrap(router)
	httpHandler = middleware.NewCompress().Wrap(httpHandler)

	routePrefix := globalConfig.ExternalPath()
	if routePrefix != "" {
		prefixed := http.StripPrefix(routePrefix, httpHandler)
		httpHandler = http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			switch req.URL.Path {
			case "/api/v1/health", "/api/v2/healthz", "/api/v2/readyz", "/api/v2/livez":
				router.ServeHTTP(w, req)
				return
			}

			prefixed.ServeHTTP(w, req)
		})
	}

	httpServer, err := httpserver.New(settings.Logger(), config.Config, httpHandler)
	if err != nil {
		return nil, err
	}
	provider.httpServer = httpServer

	return provider, nil
}

func (provider *provider) Start(ctx context.Context) error {
	// Mount the web routes last so the catch-all prefix does not shadow API
	// routes registered on the router after construction.
	if err := provider.web.AddToRouter(provider.router); err != nil {
		return err
	}

	close(provider.healthyC)

	return provider.httpServer.Start(ctx)
}

func (provider *provider) Stop(ctx context.Context) error {
	return provider.httpServer.Stop(ctx)
}

func (provider *provider) Healthy() <-chan struct{} {
	return provider.healthyC
}

func (provider *provider) Router() *mux.Router {
	return provider.router
}

func (provider *provider) AddToRouter(router *mux.Router) error {
	if err := provider.addOrgRoutes(router); err != nil {
		return err
	}

	if err := provider.addSessionRoutes(router); err != nil {
		return err
	}

	if err := provider.addAuthDomainRoutes(router); err != nil {
		return err
	}

	if err := provider.addPreferenceRoutes(router); err != nil {
		return err
	}

	if err := provider.addUserRoutes(router); err != nil {
		return err
	}

	if err := provider.addGlobalRoutes(router); err != nil {
		return err
	}

	if err := provider.addPromoteRoutes(router); err != nil {
		return err
	}

	if err := provider.addFlaggerRoutes(router); err != nil {
		return err
	}

	if err := provider.addDashboardRoutes(router); err != nil {
		return err
	}

	if err := provider.addMetricsExplorerRoutes(router); err != nil {
		return err
	}

	if err := provider.addMetricReductionRuleRoutes(router); err != nil {
		return err
	}

	if err := provider.addInfraMonitoringRoutes(router); err != nil {
		return err
	}

	if err := provider.addGatewayRoutes(router); err != nil {
		return err
	}

	if err := provider.addRoleRoutes(router); err != nil {
		return err
	}

	if err := provider.addAuthzRoutes(router); err != nil {
		return err
	}

	if err := provider.addFieldsRoutes(router); err != nil {
		return err
	}

	if err := provider.addAIObservabilityRoutes(router); err != nil {
		return err
	}

	if err := provider.addRawDataExportRoutes(router); err != nil {
		return err
	}

	if err := provider.addLicensingRoutes(router); err != nil {
		return err
	}

	if err := provider.addZeusRoutes(router); err != nil {
		return err
	}

	if err := provider.addSubscriptionRoutes(router); err != nil {
		return err
	}

	if err := provider.addQuerierRoutes(router); err != nil {
		return err
	}

	if err := provider.addPrometheusRoutes(router); err != nil {
		return err
	}

	if err := provider.addServiceAccountRoutes(router); err != nil {
		return err
	}

	if err := provider.addRegistryRoutes(router); err != nil {
		return err
	}

	if err := provider.addCloudIntegrationRoutes(router); err != nil {
		return err
	}

	if err := provider.addRuleStateHistoryRoutes(router); err != nil {
		return err
	}

	if err := provider.addSpanMapperRoutes(router); err != nil {
		return err
	}

	if err := provider.addAlertmanagerRoutes(router); err != nil {
		return err
	}

	if err := provider.addLLMPricingRuleRoutes(router); err != nil {
		return err
	}

	if err := provider.addTraceDetailRoutes(router); err != nil {
		return err
	}

	if err := provider.addRulerRoutes(router); err != nil {
		return err
	}

	if err := provider.addStatsReporterRoutes(router); err != nil {
		return err
	}

	if err := provider.addSavedViewRoutes(router); err != nil {
		return err
	}

	if err := provider.addQuickFilterRoutes(router); err != nil {
		return err
	}

	return nil
}

func newSecuritySchemes(role types.Role) []handler.OpenAPISecurityScheme {
	return newScopedSecuritySchemes([]string{role.String()})
}

func newAnonymousSecuritySchemes(scopes []string) []handler.OpenAPISecurityScheme {
	return []handler.OpenAPISecurityScheme{
		{Name: authtypes.IdentNProviderAnonymous.StringValue(), Scopes: scopes},
	}
}

func newScopedSecuritySchemes(scopes []string) []handler.OpenAPISecurityScheme {
	return []handler.OpenAPISecurityScheme{
		{Name: authtypes.IdentNProviderAPIKey.StringValue(), Scopes: scopes},
		{Name: authtypes.IdentNProviderTokenizer.StringValue(), Scopes: scopes},
	}
}
