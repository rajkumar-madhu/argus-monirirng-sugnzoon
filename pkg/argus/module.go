package argus

import (
	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/analytics"
	"github.com/your-org/argus/pkg/authn"
	"github.com/your-org/argus/pkg/authz"
	"github.com/your-org/argus/pkg/cache"
	"github.com/your-org/argus/pkg/emailing"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/modules/apdex"
	"github.com/your-org/argus/pkg/modules/apdex/implapdex"
	"github.com/your-org/argus/pkg/modules/authdomain"
	"github.com/your-org/argus/pkg/modules/authdomain/implauthdomain"
	"github.com/your-org/argus/pkg/modules/cloudintegration"
	"github.com/your-org/argus/pkg/modules/dashboard"
	"github.com/your-org/argus/pkg/modules/inframonitoring"
	"github.com/your-org/argus/pkg/modules/inframonitoring/implinframonitoring"
	"github.com/your-org/argus/pkg/modules/llmpricingrule"
	"github.com/your-org/argus/pkg/modules/llmpricingrule/impllmpricingrule"
	"github.com/your-org/argus/pkg/modules/logspipeline"
	"github.com/your-org/argus/pkg/modules/logspipeline/impllogspipeline"
	"github.com/your-org/argus/pkg/modules/metricreductionrule"
	"github.com/your-org/argus/pkg/modules/metricsexplorer"
	"github.com/your-org/argus/pkg/modules/metricsexplorer/implmetricsexplorer"
	"github.com/your-org/argus/pkg/modules/organization"
	"github.com/your-org/argus/pkg/modules/organization/implorganization"
	"github.com/your-org/argus/pkg/modules/preference"
	"github.com/your-org/argus/pkg/modules/preference/implpreference"
	"github.com/your-org/argus/pkg/modules/promote"
	"github.com/your-org/argus/pkg/modules/promote/implpromote"
	"github.com/your-org/argus/pkg/modules/quickfilter"
	"github.com/your-org/argus/pkg/modules/quickfilter/implquickfilter"
	"github.com/your-org/argus/pkg/modules/rawdataexport"
	"github.com/your-org/argus/pkg/modules/rawdataexport/implrawdataexport"
	"github.com/your-org/argus/pkg/modules/retention"
	"github.com/your-org/argus/pkg/modules/rulestatehistory"
	"github.com/your-org/argus/pkg/modules/rulestatehistory/implrulestatehistory"
	"github.com/your-org/argus/pkg/modules/savedview"
	"github.com/your-org/argus/pkg/modules/savedview/implsavedview"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/modules/services"
	"github.com/your-org/argus/pkg/modules/services/implservices"
	"github.com/your-org/argus/pkg/modules/session"
	"github.com/your-org/argus/pkg/modules/session/implsession"
	"github.com/your-org/argus/pkg/modules/spanmapper"
	"github.com/your-org/argus/pkg/modules/spanmapper/implspanmapper"
	"github.com/your-org/argus/pkg/modules/spanpercentile"
	"github.com/your-org/argus/pkg/modules/spanpercentile/implspanpercentile"
	"github.com/your-org/argus/pkg/modules/tag"
	"github.com/your-org/argus/pkg/modules/tracedetail"
	"github.com/your-org/argus/pkg/modules/tracedetail/impltracedetail"
	"github.com/your-org/argus/pkg/modules/tracefunnel"
	"github.com/your-org/argus/pkg/modules/tracefunnel/impltracefunnel"
	"github.com/your-org/argus/pkg/modules/user"
	"github.com/your-org/argus/pkg/modules/user/impluser"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/queryparser"
	"github.com/your-org/argus/pkg/ruler/rulestore/sqlrulestore"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/telemetrystore"
	"github.com/your-org/argus/pkg/tokenizer"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/preferencetypes"
	"github.com/your-org/argus/pkg/types/telemetrytypes"
)

type Modules struct {
	OrgGetter            organization.Getter
	OrgSetter            organization.Setter
	Preference           preference.Module
	UserSetter           user.Setter
	UserGetter           user.Getter
	RetentionGetter      retention.Getter
	SavedView            savedview.Module
	Apdex                apdex.Module
	Dashboard            dashboard.Module
	QuickFilter          quickfilter.Module
	TraceFunnel          tracefunnel.Module
	RawDataExport        rawdataexport.Module
	AuthDomain           authdomain.Module
	Session              session.Module
	Services             services.Module
	SpanPercentile       spanpercentile.Module
	MetricsExplorer      metricsexplorer.Module
	MetricReductionRule  metricreductionrule.Module
	InfraMonitoring      inframonitoring.Module
	Promote              promote.Module
	ServiceAccount       serviceaccount.Module
	ServiceAccountGetter serviceaccount.Getter
	CloudIntegration     cloudintegration.Module
	LogsPipeline         logspipeline.Module
	RuleStateHistory     rulestatehistory.Module
	TraceDetail          tracedetail.Module
	SpanMapper           spanmapper.Module
	LLMPricingRule       llmpricingrule.Module
	Tag                  tag.Module
}

func NewModules(
	sqlstore sqlstore.SQLStore,
	tokenizer tokenizer.Tokenizer,
	emailing emailing.Emailing,
	providerSettings factory.ProviderSettings,
	orgGetter organization.Getter,
	alertmanager alertmanager.Alertmanager,
	analytics analytics.Analytics,
	querier querier.Querier,
	telemetryStore telemetrystore.TelemetryStore,
	telemetryMetadataStore telemetrytypes.MetadataStore,
	authNs map[authtypes.AuthNProvider]authn.AuthN,
	authz authz.AuthZ,
	cache cache.Cache,
	queryParser queryparser.QueryParser,
	config Config,
	dashboard dashboard.Module,
	userGetter user.Getter,
	userRoleStore authtypes.UserRoleStore,
	serviceAccount serviceaccount.Module,
	serviceAccountGetter serviceaccount.Getter,
	cloudIntegrationModule cloudintegration.Module,
	retentionGetter retention.Getter,
	fl flagger.Flagger,
	tagModule tag.Module,
	metricReductionRule metricreductionrule.Module,
) Modules {
	quickfilter := implquickfilter.NewModule(implquickfilter.NewStore(sqlstore))
	orgSetter := implorganization.NewSetter(implorganization.NewStore(sqlstore), alertmanager, quickfilter, dashboard)
	// Cleanup callbacks from other modules, invoked when a user is deleted.
	onDeleteUser := []user.OnDeleteUser{
		dashboard.DeletePreferencesForUser,
	}
	userSetter := impluser.NewSetter(impluser.NewStore(sqlstore, providerSettings), tokenizer, emailing, providerSettings, orgSetter, authz, analytics, config.User, userRoleStore, userGetter, onDeleteUser)
	ruleStore := sqlrulestore.NewRuleStore(sqlstore, queryParser, providerSettings)
	authDomainModule := implauthdomain.NewModule(implauthdomain.NewStore(sqlstore), authNs, authz)

	return Modules{
		OrgGetter:            orgGetter,
		OrgSetter:            orgSetter,
		Preference:           implpreference.NewModule(implpreference.NewStore(sqlstore), preferencetypes.NewAvailablePreference()),
		SavedView:            implsavedview.NewModule(implsavedview.NewStore(sqlstore)),
		Apdex:                implapdex.NewModule(sqlstore),
		Dashboard:            dashboard,
		UserSetter:           userSetter,
		UserGetter:           userGetter,
		RetentionGetter:      retentionGetter,
		QuickFilter:          quickfilter,
		TraceFunnel:          impltracefunnel.NewModule(impltracefunnel.NewStore(sqlstore)),
		RawDataExport:        implrawdataexport.NewModule(querier),
		AuthDomain:           authDomainModule,
		Session:              implsession.NewModule(providerSettings, authNs, userSetter, userGetter, authDomainModule, tokenizer, orgGetter, authz, config.Global),
		SpanPercentile:       implspanpercentile.NewModule(querier, providerSettings),
		Services:             implservices.NewModule(querier, telemetryStore),
		MetricsExplorer:      implmetricsexplorer.NewModule(telemetryStore, telemetryMetadataStore, cache, ruleStore, dashboard, fl, providerSettings, config.MetricsExplorer),
		MetricReductionRule:  metricReductionRule,
		InfraMonitoring:      implinframonitoring.NewModule(telemetryStore, telemetryMetadataStore, querier, fl, providerSettings, config.InfraMonitoring),
		Promote:              implpromote.NewModule(telemetryMetadataStore, telemetryStore),
		ServiceAccount:       serviceAccount,
		ServiceAccountGetter: serviceAccountGetter,
		LogsPipeline:         impllogspipeline.NewModule(sqlstore),
		RuleStateHistory:     implrulestatehistory.NewModule(implrulestatehistory.NewStore(telemetryStore, telemetryMetadataStore, providerSettings.Logger), ruleStore),
		CloudIntegration:     cloudIntegrationModule,
		TraceDetail:          impltracedetail.NewModule(impltracedetail.NewTraceStore(telemetryStore), providerSettings, config.TraceDetail),
		SpanMapper:           implspanmapper.NewModule(implspanmapper.NewStore(sqlstore), fl),
		LLMPricingRule:       impllmpricingrule.NewModule(impllmpricingrule.NewStore(sqlstore), fl, querier),
		Tag:                  tagModule,
	}
}
