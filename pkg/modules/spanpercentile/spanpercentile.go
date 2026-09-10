package spanpercentile

import (
	"context"
	"net/http"

	"github.com/your-org/argus/pkg/types/spanpercentiletypes"
	"github.com/your-org/argus/pkg/valuer"
)

type Module interface {
	GetSpanPercentile(ctx context.Context, orgID valuer.UUID, req *spanpercentiletypes.SpanPercentileRequest) (*spanpercentiletypes.SpanPercentileResponse, error)
}

type Handler interface {
	GetSpanPercentileDetails(http.ResponseWriter, *http.Request)
}
