package argus

import (
	"context"
	"log/slog"
	"reflect"

	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/analytics"
	"github.com/your-org/argus/pkg/apiserver"
	"github.com/your-org/argus/pkg/auditor"
	"github.com/your-org/argus/pkg/authz"
	"github.com/your-org/argus/pkg/cache"
	"github.com/your-org/argus/pkg/config"
	"github.com/your-org/argus/pkg/emailing"
	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/gateway"
	"github.com/your-org/argus/pkg/global"
	"github.com/your-org/argus/pkg/identn"
	"github.com/your-org/argus/pkg/instrumentation"
	"github.com/your-org/argus/pkg/meterreporter"
	"github.com/your-org/argus/pkg/modules/cloudintegration"
	"github.com/your-org/argus/pkg/modules/inframonitoring"
	"github.com/your-org/argus/pkg/modules/metricsexplorer"
	"github.com/your-org/argus/pkg/modules/serviceaccount"
	"github.com/your-org/argus/pkg/modules/tracedetail"
	"github.com/your-org/argus/pkg/modules/user"
	"github.com/your-org/argus/pkg/pprof"
	"github.com/your-org/argus/pkg/prometheus"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/ruler"
	"github.com/your-org/argus/pkg/sharder"
	"github.com/your-org/argus/pkg/sqlmigration"
	"github.com/your-org/argus/pkg/sqlmigrator"
	"github.com/your-org/argus/pkg/sqlschema"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/statsreporter"
	"github.com/your-org/argus/pkg/telemetrystore"
	"github.com/your-org/argus/pkg/tokenizer"
	"github.com/your-org/argus/pkg/valuer"
	"github.com/your-org/argus/pkg/version"
	"github.com/your-org/argus/pkg/web"
)

// Config defines the entire input configuration of argus.
type Config struct {
	// Global config
	Global global.Config `mapstructure:"global"`

	// Version config
	Version version.Config `mapstructure:"version"`

	// Instrumentation config
	Instrumentation instrumentation.Config `mapstructure:"instrumentation"`

	// PProf config
	PProf pprof.Config `mapstructure:"pprof"`

	// Analytics config
	Analytics analytics.Config `mapstructure:"analytics"`

	// Web config
	Web web.Config `mapstructure:"web"`

	// Cache config
	Cache cache.Config `mapstructure:"cache"`

	// SQLStore config
	SQLStore sqlstore.Config `mapstructure:"sqlstore"`

	// SQLMigration config
	SQLMigration sqlmigration.Config `mapstructure:"sqlmigration"`

	// SQLMigrator config
	SQLMigrator sqlmigrator.Config `mapstructure:"sqlmigrator"`

	// SQLSchema config
	SQLSchema sqlschema.Config `mapstructure:"sqlschema"`

	// API Server config
	APIServer apiserver.Config `mapstructure:"apiserver"`

	// TelemetryStore config
	TelemetryStore telemetrystore.Config `mapstructure:"telemetrystore"`

	// Prometheus config
	Prometheus prometheus.Config `mapstructure:"prometheus"`

	// Alertmanager config
	Alertmanager alertmanager.Config `mapstructure:"alertmanager" yaml:"alertmanager"`

	// Querier config
	Querier querier.Config `mapstructure:"querier"`

	// Ruler config
	Ruler ruler.Config `mapstructure:"ruler"`

	// Emailing config
	Emailing emailing.Config `mapstructure:"emailing" yaml:"emailing"`

	// Sharder config
	Sharder sharder.Config `mapstructure:"sharder" yaml:"sharder"`

	// StatsReporter config
	StatsReporter statsreporter.Config `mapstructure:"statsreporter"`

	// Gateway config
	Gateway gateway.Config `mapstructure:"gateway"`

	// Tokenizer config
	Tokenizer tokenizer.Config `mapstructure:"tokenizer"`

	// MetricsExplorer config
	MetricsExplorer metricsexplorer.Config `mapstructure:"metricsexplorer"`

	// InfraMonitoring config
	InfraMonitoring inframonitoring.Config `mapstructure:"inframonitoring"`

	// Flagger config
	Flagger flagger.Config `mapstructure:"flagger"`

	// User config
	User user.Config `mapstructure:"user"`

	// IdentN config
	IdentN identn.Config `mapstructure:"identn"`

	// ServiceAccount config
	ServiceAccount serviceaccount.Config `mapstructure:"serviceaccount"`

	// Auditor config
	Auditor auditor.Config `mapstructure:"auditor"`

	// MeterReporter config
	MeterReporter meterreporter.Config `mapstructure:"meterreporter"`

	// CloudIntegration config
	CloudIntegration cloudintegration.Config `mapstructure:"cloudintegration"`

	// TraceDetail config
	TraceDetail tracedetail.Config `mapstructure:"traces"`

	// Authz config
	Authz authz.Config `mapstructure:"authz"`
}

func NewConfig(ctx context.Context, logger *slog.Logger, resolverConfig config.ResolverConfig) (Config, error) {
	configFactories := []factory.ConfigFactory{
		global.NewConfigFactory(),
		version.NewConfigFactory(),
		instrumentation.NewConfigFactory(),
		pprof.NewConfigFactory(),
		analytics.NewConfigFactory(),
		web.NewConfigFactory(),
		cache.NewConfigFactory(),
		sqlstore.NewConfigFactory(),
		sqlmigrator.NewConfigFactory(),
		sqlschema.NewConfigFactory(),
		apiserver.NewConfigFactory(),
		telemetrystore.NewConfigFactory(),
		prometheus.NewConfigFactory(),
		alertmanager.NewConfigFactory(),
		querier.NewConfigFactory(),
		ruler.NewConfigFactory(),
		emailing.NewConfigFactory(),
		sharder.NewConfigFactory(),
		statsreporter.NewConfigFactory(),
		gateway.NewConfigFactory(),
		tokenizer.NewConfigFactory(),
		metricsexplorer.NewConfigFactory(),
		inframonitoring.NewConfigFactory(),
		flagger.NewConfigFactory(),
		user.NewConfigFactory(),
		identn.NewConfigFactory(),
		serviceaccount.NewConfigFactory(),
		auditor.NewConfigFactory(),
		meterreporter.NewConfigFactory(),
		cloudintegration.NewConfigFactory(),
		tracedetail.NewConfigFactory(),
		authz.NewConfigFactory(),
	}

	conf, err := config.New(ctx, resolverConfig, configFactories)
	if err != nil {
		return Config{}, err
	}

	var config Config
	if err := conf.Unmarshal("", &config, "yaml"); err != nil {
		return Config{}, err
	}

	if err := validateConfig(config); err != nil {
		return Config{}, err
	}

	return config, nil
}

func validateConfig(config Config) error {
	rvConfig := reflect.ValueOf(config)
	for i := 0; i < rvConfig.NumField(); i++ {
		factoryConfig, ok := rvConfig.Field(i).Interface().(factory.Config)
		if !ok {
			return errors.NewInvalidInputf(errors.CodeInvalidInput, "%q is not of type \"factory.Config\"", rvConfig.Type().Field(i).Name)
		}

		if err := factoryConfig.Validate(); err != nil {
			return errors.WrapInvalidInputf(err, errors.CodeInvalidInput, "failed to validate config %q", rvConfig.Type().Field(i).Tag.Get("mapstructure"))
		}
	}

	return nil
}

func (config Config) Collect(_ context.Context, _ valuer.UUID) (map[string]any, error) {
	stats := make(map[string]any)

	// SQL Store Config Stats
	stats["config.sqlstore.provider"] = config.SQLStore.Provider

	// Tokenizer Config Stats
	stats["config.tokenizer.provider"] = config.Tokenizer.Provider

	// Cache Config Stats
	stats["config.cache.provider"] = config.Cache.Provider

	return stats, nil
}
