package argus

import (
	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/alertmanager/argusalertmanager"
	"github.com/your-org/argus/pkg/analytics"
	"github.com/your-org/argus/pkg/authz"
	"github.com/your-org/argus/pkg/authz/argusauthzapi"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/gateway"
	"github.com/your-org/argus/pkg/global"
	"github.com/your-org/argus/pkg/global/argusglobal"
	"github.com/your-org/argus/pkg/licensing"
	"github.com/your-org/argus/pkg/modules/aiobservability"
	"github.com/your-org/argus/pkg/modules/aiobservability/implaiobservability"
	"github.com/your-org/argus/pkg/modules/apdex"
	"github.com/your-org/argus/pkg/modules/apdex/implapdex"
	"github.com/your-org/argus/pkg/modules/cloudintegration"
	"github.com/your-org/argus/pkg/modules/cloudintegration/implcloudintegration"
	"github.com/your-org/argus/pkg/modules/dashboard"
	"github.com/your-org/argus/pkg/modules/dashboard/impldashboard"
	"github.com/your-org/argus/pkg/modules/fields"
	"github.com/your-org/argus/pkg/modules/fields/implfields"
	"github.com/your-org/argus/pkg/modules/inframonitoring"
	"github.com/your-org/argus/pkg/modules/inframonitoring/implinframonitoring"
	"github.com/your-org/argus/pkg/modules/llmpricingrule"
	"github.com/your-org/argus/pkg/modules/llmpricingrule/impllmpricingrule"
	"github.com/your-org/argus/pkg/modules/metricreductionrule"
	"github.com/your-org/argus/pkg/modules/metricreductionrule/implmetricreductionrule"
	"github.com/your-org/argus/pkg/modules/metricsexplorer"
	"github.com/your-org/argus/pkg/modules/metricsexplorer/implmetricsexplorer"
	"github.com/your-org/argus/pkg/modules/quickfilter"
	"github.com/your-org/argus/pkg/modules/quickfilter/implquickfilter"
	"github.com/your-org/argus/pkg/modules/rawdataexport"
	"github.com/your-org/argus/pkg/modules/rawdataexport/implrawdataexport"
	"github.com/your-org/argus/pkg/modules/rulestatehistory"
	"github.com/your-org/argus/pkg/modules/rulestatehistory/implrulestatehistory"
	"github.com/your-org/argus/pkg/modules/savedview"
	"github.com/your-org/argus/pkg/modules/savedview/implsavedview"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/modules/serviceaccount/implserviceaccount"
	"github.com/your-org/argus/pkg/modules/services"
	"github.com/your-org/argus/pkg/modules/services/implservices"
	"github.com/your-org/argus/pkg/modules/spanmapper"
	"github.com/your-org/argus/pkg/modules/spanmapper/implspanmapper"
	"github.com/your-org/argus/pkg/modules/spanpercentile"
	"github.com/your-org/argus/pkg/modules/spanpercentile/implspanpercentile"
	"github.com/your-org/argus/pkg/modules/tracedetail"
	"github.com/your-org/argus/pkg/modules/tracedetail/impltracedetail"
	"github.com/your-org/argus/pkg/modules/tracefunnel"
	"github.com/your-org/argus/pkg/modules/tracefunnel/impltracefunnel"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/ruler"
	"github.com/your-org/argus/pkg/ruler/argusruler"
	"github.com/your-org/argus/pkg/statsreporter"
	"github.com/your-org/argus/pkg/subscription"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
	"github.com/your-org/argus/pkg/zeus"
)

type Handlers struct {
	SavedView               savedview.Handler
	Apdex                   apdex.Handler
	Dashboard               dashboard.Handler
	QuickFilter             quickfilter.Handler
	TraceFunnel             tracefunnel.Handler
	RawDataExport           rawdataexport.Handler
	SpanPercentile          spanpercentile.Handler
	Services                services.Handler
	MetricsExplorer         metricsexplorer.Handler
	MetricReductionRule     metricreductionrule.Handler
	InfraMonitoring         inframonitoring.Handler
	Global                  global.Handler
	FlaggerHandler          flagger.Handler
	GatewayHandler          gateway.Handler
	Fields                  fields.Handler
	AIObservability         aiobservability.Handler
	AuthzHandler            authz.Handler
	ZeusHandler             zeus.Handler
	LicensingHandler        licensing.Handler
	SubscriptionHandler     subscription.Handler
	QuerierHandler          querier.Handler
	ServiceAccountHandler   serviceaccount.Handler
	RegistryHandler         factory.Handler
	CloudIntegrationHandler cloudintegration.Handler
	RuleStateHistory        rulestatehistory.Handler
	SpanMapperHandler       spanmapper.Handler
	AlertmanagerHandler     alertmanager.Handler
	PrometheusHandler       prometheus.Handler
	TraceDetail             tracedetail.Handler
	RulerHandler            ruler.Handler
	LLMPricingRuleHandler   llmpricingrule.Handler
	StatsHandler            statsreporter.Handler
}

func NewHandlers(
	modules Modules,
	providerSettings factory.ProviderSettings,
	analytics analytics.Analytics,
	querierHandler querier.Handler,
	licensingService licensing.Licensing,
	global global.Global,
	flaggerService flagger.Flagger,
	gatewayService gateway.Gateway,
	telemetryMetadataStore telemetrytypes.MetadataStore,
	authz authz.AuthZ,
	zeusService zeus.Zeus,
	subscriptionService subscription.Subscription,
	registryHandler factory.Handler,
	alertmanagerService alertmanager.Alertmanager,
	prometheusService prometheus.Prometheus,
	rulerService ruler.Ruler,
	statsAggregator statsreporter.Aggregator,
) Handlers {
	return Handlers{
		SavedView:               implsavedview.NewHandler(modules.SavedView),
		Apdex:                   implapdex.NewHandler(modules.Apdex),
		Dashboard:               impldashboard.NewHandler(modules.Dashboard, providerSettings, authz),
		QuickFilter:             implquickfilter.NewHandler(modules.QuickFilter),
		TraceFunnel:             impltracefunnel.NewHandler(modules.TraceFunnel),
		RawDataExport:           implrawdataexport.NewHandler(modules.RawDataExport),
		Services:                implservices.NewHandler(modules.Services),
		MetricsExplorer:         implmetricsexplorer.NewHandler(modules.MetricsExplorer),
		MetricReductionRule:     implmetricreductionrule.NewHandler(modules.MetricReductionRule),
		InfraMonitoring:         implinframonitoring.NewHandler(modules.InfraMonitoring),
		SpanPercentile:          implspanpercentile.NewHandler(modules.SpanPercentile),
		Global:                  argusglobal.NewHandler(global),
		FlaggerHandler:          flagger.NewHandler(flaggerService),
		GatewayHandler:          gateway.NewHandler(gatewayService),
		Fields:                  implfields.NewHandler(providerSettings, telemetryMetadataStore),
		AIObservability:         implaiobservability.NewHandler(providerSettings, telemetryMetadataStore),
		AuthzHandler:            argusauthzapi.NewHandler(authz),
		ZeusHandler:             zeus.NewHandler(zeusService, licensingService),
		LicensingHandler:        licensing.NewHandler(licensingService),
		SubscriptionHandler:     subscription.NewHandler(subscriptionService),
		QuerierHandler:          querierHandler,
		ServiceAccountHandler:   implserviceaccount.NewHandler(modules.ServiceAccount, modules.ServiceAccountGetter),
		RegistryHandler:         registryHandler,
		RuleStateHistory:        implrulestatehistory.NewHandler(modules.RuleStateHistory),
		CloudIntegrationHandler: implcloudintegration.NewHandler(modules.CloudIntegration),
		SpanMapperHandler:       implspanmapper.NewHandler(modules.SpanMapper),
		AlertmanagerHandler:     argusalertmanager.NewHandler(alertmanagerService),
		PrometheusHandler:       prometheus.NewHandler(providerSettings.Logger, prometheusService),
		TraceDetail:             impltracedetail.NewHandler(modules.TraceDetail),
		RulerHandler:            argusruler.NewHandler(rulerService),
		LLMPricingRuleHandler:   impllmpricingrule.NewHandler(modules.LLMPricingRule),
		StatsHandler:            statsreporter.NewHandler(statsAggregator),
	}
}
