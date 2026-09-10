package types

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/your-org/argus/pkg/valuer"
)

func TestMustGenerateFactorPassword(t *testing.T) {
	assert.NotPanics(t, func() {
		MustGenerateFactorPassword(valuer.GenerateUUID().String())
	})
}
