package apiserver

import (
	"github.com/gorilla/mux"
	"github.com/your-org/argus/pkg/factory"
)

type APIServer interface {
	// APIServer is a long running service serving the Argus API.
	factory.ServiceWithHealthy

	// Returns the mux router for the API server. Primarily used for collecting OpenAPI operations.
	Router() *mux.Router

	// Adds the API server routes to an existing router. This is a backwards compatible method for adding routes to the input router.
	AddToRouter(router *mux.Router) error
}
