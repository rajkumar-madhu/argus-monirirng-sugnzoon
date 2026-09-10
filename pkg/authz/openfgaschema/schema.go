package openfgaschema

import (
	"context"
	_ "embed"

	openfgapkgtransformer "github.com/openfga/language/pkg/go/transformer"
	"github.com/your-org/argus/pkg/authz"
)

var (
	//go:embed base.fga
	baseDSL string
)

type schema struct{}

func NewSchema() authz.Schema {
	return &schema{}
}

func (schema *schema) Get(ctx context.Context) []openfgapkgtransformer.ModuleFile {
	return []openfgapkgtransformer.ModuleFile{
		{
			Name:     "base.fga",
			Contents: baseDSL,
		},
	}
}
