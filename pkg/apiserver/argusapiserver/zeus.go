package argusapiserver

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/your-org/argus/pkg/http/handler"
	"github.com/your-org/argus/pkg/types"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/coretypes"
	"github.com/your-org/argus/pkg/types/zeustypes"
)

func (provider *provider) addZeusRoutes(router *mux.Router) error {
	if err := router.Handle("/api/v2/zeus/profiles", handler.New(provider.authzMiddleware.AdminAccess(provider.zeusHandler.PutProfile), handler.OpenAPIDef{
		ID:                  "PutProfile",
		Tags:                []string{"zeus"},
		Summary:             "Put profile in Zeus for a deployment.",
		Description:         "This endpoint saves the profile of a deployment to zeus.",
		Request:             new(zeustypes.PostableProfile),
		RequestContentType:  "application/json",
		Response:            nil,
		ResponseContentType: "",
		SuccessStatusCode:   http.StatusNoContent,
		ErrorStatusCodes:    []int{http.StatusBadRequest, http.StatusUnauthorized, http.StatusForbidden, http.StatusNotFound, http.StatusConflict},
		Deprecated:          false,
		SecuritySchemes:     newSecuritySchemes(types.RoleAdmin),
	})).Methods(http.MethodPut).GetError(); err != nil {
		return err
	}

	if err := router.Handle("/api/v2/zeus/hosts", handler.New(provider.authzMiddleware.CheckResources(provider.zeusHandler.GetHosts, authtypes.ArgusAdminRoleName, authtypes.ArgusEditorRoleName, authtypes.ArgusViewerRoleName), handler.OpenAPIDef{
		ID:                  "GetHosts",
		Tags:                []string{"zeus"},
		Summary:             "Get host info from Zeus.",
		Description:         "This endpoint gets the host info from zeus.",
		Request:             nil,
		RequestContentType:  "",
		Response:            new(zeustypes.GettableHost),
		ResponseContentType: "application/json",
		SuccessStatusCode:   http.StatusOK,
		ErrorStatusCodes:    []int{http.StatusBadRequest, http.StatusUnauthorized, http.StatusForbidden, http.StatusNotFound},
		Deprecated:          false,
		SecuritySchemes:     newScopedSecuritySchemes([]string{coretypes.ResourceMetaResourceDeploymentHost.Scope(coretypes.VerbList)}),
	}, handler.WithResourceDefs(handler.BasicResourceDef{
		Resource: coretypes.ResourceMetaResourceDeploymentHost,
		Verb:     coretypes.VerbList,
		Category: coretypes.ActionCategoryDataAccess,
		Selector: coretypes.WildcardSelector,
	}))).Methods(http.MethodGet).GetError(); err != nil {
		return err
	}

	if err := router.Handle("/api/v2/zeus/hosts", handler.New(provider.authzMiddleware.CheckResources(provider.zeusHandler.PutHost, authtypes.ArgusAdminRoleName), handler.OpenAPIDef{
		ID:                  "PutHost",
		Tags:                []string{"zeus"},
		Summary:             "Put host in Zeus for a deployment.",
		Description:         "This endpoint saves the host of a deployment to zeus.",
		Request:             new(zeustypes.PostableHost),
		RequestContentType:  "application/json",
		Response:            nil,
		ResponseContentType: "",
		SuccessStatusCode:   http.StatusNoContent,
		ErrorStatusCodes:    []int{http.StatusBadRequest, http.StatusUnauthorized, http.StatusForbidden, http.StatusNotFound, http.StatusConflict},
		Deprecated:          false,
		SecuritySchemes:     newScopedSecuritySchemes([]string{coretypes.ResourceMetaResourceDeploymentHost.Scope(coretypes.VerbUpdate)}),
	}, handler.WithResourceDefs(handler.BasicResourceDef{
		Resource: coretypes.ResourceMetaResourceDeploymentHost,
		Verb:     coretypes.VerbUpdate,
		Category: coretypes.ActionCategoryConfigurationChange,
		ID:       coretypes.BodyJSONPath("name"),
		Selector: coretypes.WildcardSelector,
	}))).Methods(http.MethodPut).GetError(); err != nil {
		return err
	}

	return nil
}
