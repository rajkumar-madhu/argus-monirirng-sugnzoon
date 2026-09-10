package types

import (
	"github.com/your-org/argus/pkg/valuer"
)

type Identifiable struct {
	ID valuer.UUID `json:"id" bun:"id,pk,type:text" required:"true"`
}
