package argusapiserver

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/your-org/argus/pkg/http/handler"
	"github.com/your-org/argus/pkg/types/authtypes"
)

func (provider *provider) addAuthzRoutes(router *mux.Router) error {
	if err := router.Handle("/api/v1/authz/check", handler.New(provider.authzHandler.Check, handler.OpenAPIDef{
		ID:                  "AuthzCheck",
		Tags:                []string{"authz"},
		Summary:             "Check permissions",
		Description:         "Checks if the authenticated user has permissions for given transactions",
		Request:             make([]*authtypes.Transaction, 0),
		RequestContentType:  "",
		Response:            make([]*authtypes.GettableTransaction, 0),
		ResponseContentType: "application/json",
		SuccessStatusCode:   http.StatusOK,
		ErrorStatusCodes:    []int{},
		Deprecated:          false,
		SecuritySchemes:     nil,
	})).Methods(http.MethodPost).GetError(); err != nil {
		return err
	}

	return nil
}
