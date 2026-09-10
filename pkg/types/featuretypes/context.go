package featuretypes

import (
	"github.com/open-feature/go-sdk/openfeature"
	"github.com/your-org/argus/pkg/valuer"
)

// A concrete wrapper around the openfeature.EvaluationContext.
type FlaggerEvaluationContext struct {
	ctx openfeature.EvaluationContext
}

// Creates a new FlaggerEvaluationContext with given details.
func NewFlaggerEvaluationContext(orgID valuer.UUID) FlaggerEvaluationContext {
	ctx := openfeature.NewTargetlessEvaluationContext(map[string]any{
		"orgId": orgID.String(),
	})
	return FlaggerEvaluationContext{ctx: ctx}
}

func (ctx FlaggerEvaluationContext) Ctx() openfeature.EvaluationContext {
	return ctx.ctx
}
