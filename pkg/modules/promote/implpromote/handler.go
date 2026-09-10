package implpromote

import (
	"net/http"

	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/http/binding"
	"github.com/your-org/argus/pkg/http/render"
	"github.com/your-org/argus/pkg/modules/promote"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/promotetypes"
)

type handler struct {
	module promote.Module
}

func NewHandler(module promote.Module) promote.Handler {
	return &handler{module: module}
}

func (h *handler) HandlePromoteAndIndexPaths(w http.ResponseWriter, r *http.Request) {
	// TODO(Nitya): Use in multi tenant setup
	_, err := authtypes.ClaimsFromContext(r.Context())
	if err != nil {
		render.Error(w, errors.NewInternalf(errors.CodeInternal, "failed to get org id from context"))
		return
	}

	var req []*promotetypes.PromotePath
	if err := binding.JSON.BindBody(r.Body, &req); err != nil {
		render.Error(w, err)
		return
	}

	err = h.module.PromoteAndIndexPaths(r.Context(), req...)
	if err != nil {
		render.Error(w, err)
		return
	}

	render.Success(w, http.StatusCreated, nil)
}

func (h *handler) ListPromotedAndIndexedPaths(w http.ResponseWriter, r *http.Request) {
	// TODO(Nitya): Use in multi tenant setup
	_, err := authtypes.ClaimsFromContext(r.Context())
	if err != nil {
		render.Error(w, errors.NewInternalf(errors.CodeInternal, "failed to get org id from context"))
		return
	}

	paths, err := h.module.ListPromotedAndIndexedPaths(r.Context())
	if err != nil {
		render.Error(w, err)
		return
	}

	render.Success(w, http.StatusOK, paths)
}
