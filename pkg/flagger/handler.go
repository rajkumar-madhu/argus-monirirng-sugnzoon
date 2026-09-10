package flagger

import (
	"context"
	"net/http"
	"time"

	"github.com/your-org/argus/pkg/http/render"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/featuretypes"
	"github.com/your-org/argus/pkg/valuer"
)

type Handler interface {
	GetFeatures(http.ResponseWriter, *http.Request)
}

type handler struct {
	flagger Flagger
}

func NewHandler(flagger Flagger) Handler {
	return &handler{
		flagger: flagger,
	}
}

func (handler *handler) GetFeatures(rw http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	claims, err := authtypes.ClaimsFromContext(ctx)
	if err != nil {
		render.Error(rw, err)
		return
	}

	orgID := valuer.MustNewUUID(claims.OrgID)

	evalCtx := featuretypes.NewFlaggerEvaluationContext(orgID)

	features, err := handler.flagger.List(ctx, evalCtx)
	if err != nil {
		render.Error(rw, err)
		return
	}

	render.Success(rw, http.StatusOK, features)
}
