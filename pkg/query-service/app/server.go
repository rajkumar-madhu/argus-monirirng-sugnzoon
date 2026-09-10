package app

import (
	"context"

	"github.com/your-org/argus/pkg/queryparser"

	"github.com/your-org/argus/pkg/argus"
	"github.com/your-org/argus/pkg/http/middleware"
	"github.com/your-org/argus/pkg/query-service/agentConf"
	"github.com/your-org/argus/pkg/query-service/app/clickhouseReader"
	"github.com/your-org/argus/pkg/query-service/app/integrations"
	"github.com/your-org/argus/pkg/query-service/app/logparsingpipeline"
	"github.com/your-org/argus/pkg/query-service/app/opamp"
	opAmpModel "github.com/your-org/argus/pkg/query-service/app/opamp/model"

	"log/slog"

	"github.com/your-org/argus/pkg/query-service/constants"
)

// Server runs auxiliary servers (opamp) alongside the Argus API server.
type Server struct {
	opampServer *opamp.Server
}

// NewServer creates and initializes Server
func NewServer(config argus.Config, appInstance *argus.Argus) (*Server, error) {
	integrationsController, err := integrations.NewController(appInstance.SQLStore, appInstance.Modules.Dashboard)
	if err != nil {
		return nil, err
	}

	reader := clickhouseReader.NewReader(
		appInstance.Instrumentation.Logger(),
		appInstance.SQLStore,
		appInstance.TelemetryStore,
		appInstance.Prometheus,
		appInstance.TelemetryStore.Cluster(),
		appInstance.Cache,
		appInstance.Flagger,
		nil,
	)

	logParsingPipelineController, err := logparsingpipeline.NewLogParsingPipelinesController(
		appInstance.SQLStore,
		integrationsController.GetPipelinesForInstalledIntegrations,
		reader,
		appInstance.Flagger,
	)
	if err != nil {
		return nil, err
	}

	apiHandler, err := NewAPIHandler(APIHandlerOpts{
		Reader:                        reader,
		IntegrationsController:        integrationsController,
		LogsParsingPipelineController: logParsingPipelineController,
		FluxInterval:                  config.Querier.FluxInterval,
		Argus:                         appInstance,
		QueryParserAPI:                queryparser.NewAPI(appInstance.Instrumentation.ToProviderSettings(), appInstance.QueryParser),
	}, config)
	if err != nil {
		return nil, err
	}

	// Register the legacy query-service routes on the apiserver router. The
	// apiserver owns the HTTP server and applies the middleware chain at serve
	// time, so these routes get the same treatment as the apiserver routes.
	r := appInstance.APIServer.Router()
	am := middleware.NewAuthZ(appInstance.Instrumentation.Logger(), appInstance.Modules.OrgGetter, appInstance.Authz)

	apiHandler.RegisterRoutes(r, am)
	apiHandler.RegisterLogsRoutes(r, am)
	apiHandler.RegisterIntegrationRoutes(r, am)
	apiHandler.RegisterQueryRangeV3Routes(r, am)
	apiHandler.RegisterQueryRangeV4Routes(r, am)
	apiHandler.RegisterMessagingQueuesRoutes(r, am)
	apiHandler.RegisterThirdPartyApiRoutes(r, am)
	apiHandler.RegisterTraceFunnelsRoutes(r, am)

	opAmpModel.Init(appInstance.SQLStore, appInstance.Instrumentation.Logger(), appInstance.Modules.OrgGetter)

	agentConfMgr, err := agentConf.Initiate(
		&agentConf.ManagerOptions{
			Store: appInstance.SQLStore,
			AgentFeatures: []agentConf.AgentFeature{
				logParsingPipelineController,
				appInstance.Modules.SpanMapper,
				appInstance.Modules.LLMPricingRule,
			},
		},
	)
	if err != nil {
		return nil, err
	}

	s := &Server{}

	s.opampServer = opamp.InitializeServer(
		&opAmpModel.AllAgents,
		agentConfMgr,
		appInstance.Instrumentation,
	)

	return s, nil
}

// Start starts the opamp websocket server. The HTTP API server is started by
// the Argus registry.
func (s *Server) Start(ctx context.Context) error {
	slog.Info("Starting OpAmp Websocket server", "addr", constants.OpAmpWsEndpoint)
	if err := s.opampServer.Start(constants.OpAmpWsEndpoint); err != nil {
		return err
	}

	return nil
}

func (s *Server) Stop(ctx context.Context) error {
	s.opampServer.Stop()

	return nil
}
