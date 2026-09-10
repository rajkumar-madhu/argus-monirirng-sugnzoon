package argusapiserver

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/your-org/argus/pkg/http/handler"
	"github.com/your-org/argus/pkg/types/globaltypes"
)

func (provider *provider) addGlobalRoutes(router *mux.Router) error {
	if err := router.Handle("/api/v1/global/config", handler.New(provider.authzMiddleware.OpenAccess(provider.globalHandler.GetConfig), handler.OpenAPIDef{
		ID:                  "GetGlobalConfig",
		Tags:                []string{"global"},
		Summary:             "Get global config",
		Description:         "This endpoint returns global config",
		Request:             nil,
		RequestContentType:  "",
		Response:            new(globaltypes.Config),
		ResponseContentType: "application/json",
		SuccessStatusCode:   http.StatusOK,
		ErrorStatusCodes:    []int{},
		Deprecated:          false,
		SecuritySchemes:     nil,
	})).Methods(http.MethodGet).GetError(); err != nil {
		return err
	}

	return nil
}
