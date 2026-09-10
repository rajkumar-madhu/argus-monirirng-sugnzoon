package argus

import (
	"context"
	"reflect"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/alertmanager"
	"github.com/your-org/argus/pkg/alertmanager/alertmanagerstore/sqlalertmanagerstore"
	"github.com/your-org/argus/pkg/alertmanager/argusalertmanager"
	"github.com/your-org/argus/pkg/alertmanager/nfmanager/nfmanagertest"
	"github.com/your-org/argus/pkg/emailing/emailingtest"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/factory/factorytest"
	"github.com/your-org/argus/pkg/flagger"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
	"github.com/your-org/argus/pkg/modules/dashboard/impldashboard"
	"github.com/your-org/argus/pkg/modules/organization/implorganization"
	"github.com/your-org/argus/pkg/modules/retention/implretention"
	"github.com/your-org/argus/pkg/modules/tag/impltag"
	"github.com/your-org/argus/pkg/modules/user/impluser"
	"github.com/your-org/argus/pkg/querier"
	"github.com/your-org/argus/pkg/queryparser"
	"github.com/your-org/argus/pkg/sharder"
	"github.com/your-org/argus/pkg/sharder/noopsharder"
	"github.com/your-org/argus/pkg/sqlstore"
	"github.com/your-org/argus/pkg/sqlstore/sqlstoretest"
	"github.com/your-org/argus/pkg/tokenizer/tokenizertest"
)

// This is a test to ensure that all fields of the handlers are initialized.
// It also helps us catch these errors at compile time instead of runtime.
func TestNewHandlers(t *testing.T) {
	sqlstore := sqlstoretest.New(sqlstore.Config{Provider: "sqlite"}, sqlmock.QueryMatcherEqual)
	providerSettings := factorytest.NewSettings()
	sharder, err := noopsharder.New(context.TODO(), providerSettings, sharder.Config{})
	require.NoError(t, err)
	orgGetter := implorganization.NewGetter(implorganization.NewStore(sqlstore), sharder)
	notificationManager := nfmanagertest.NewMock()
	require.NoError(t, err)
	maintenanceStore := sqlalertmanagerstore.NewMaintenanceStore(sqlstore, providerSettings)
	alertmanager, err := argusalertmanager.New(providerSettings, alertmanager.Config{}, sqlstore, orgGetter, notificationManager, maintenanceStore)
	require.NoError(t, err)
	tokenizer := tokenizertest.NewMockTokenizer(t)
	emailing := emailingtest.New()
	queryParser := queryparser.New(providerSettings)
	require.NoError(t, err)
	tagModule := impltag.NewModule(impltag.NewStore(sqlstore))
	systemDashboardRegistry, err := impldashboard.NewSystemDashboardRegistry()
	require.NoError(t, err)
	dashboardModule := impldashboard.NewModule(impldashboard.NewStore(sqlstore), providerSettings, nil, orgGetter, queryParser, tagModule, systemDashboardRegistry)

	flagger, err := flagger.New(context.Background(), instrumentationtest.New().ToProviderSettings(), flagger.Config{}, flagger.MustNewRegistry())
	require.NoError(t, err)

	userRoleStore := impluser.NewUserRoleStore(sqlstore, providerSettings)

	userGetter := impluser.NewGetter(impluser.NewStore(sqlstore, providerSettings), userRoleStore, flagger)

	retentionGetter := implretention.NewGetter(implretention.NewStore(sqlstore))
	modules := NewModules(sqlstore, tokenizer, emailing, providerSettings, orgGetter, alertmanager, nil, nil, nil, nil, nil, nil, nil, queryParser, Config{}, dashboardModule, userGetter, userRoleStore, nil, nil, nil, retentionGetter, flagger, tagModule, nil)

	querierHandler := querier.NewHandler(providerSettings, nil, nil)
	registryHandler := factory.NewHandler(nil)
	handlers := NewHandlers(modules, providerSettings, nil, querierHandler, nil, nil, nil, nil, nil, nil, nil, nil, registryHandler, alertmanager, nil, nil, nil)
	reflectVal := reflect.ValueOf(handlers)
	for i := 0; i < reflectVal.NumField(); i++ {
		f := reflectVal.Field(i)
		assert.False(t, f.IsZero(), "%s handler has not been initialized", reflectVal.Type().Field(i).Name)
	}
}
