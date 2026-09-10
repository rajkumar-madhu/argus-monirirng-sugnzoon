package preferencetypes

import "github.com/your-org/argus/pkg/valuer"

var (
	ScopeOrg  = Scope{valuer.NewString("org")}
	ScopeUser = Scope{valuer.NewString("user")}
)

type Scope struct{ valuer.String }
