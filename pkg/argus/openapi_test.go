package argus

import (
	"context"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
)

// Exercise the published schema, including custom discriminator promotion.
// A mapping must reference a real oneOf variant, not a stale module-derived name.
func TestOpenAPIDiscriminatorReferences(t *testing.T) {
	api, err := NewOpenAPI(context.Background(), instrumentationtest.New())
	require.NoError(t, err)
	require.NoError(t, api.CreateAndWrite(filepath.Join(t.TempDir(), "openapi.yml")))
	require.NotNil(t, api.reflector.Spec.Components)
	require.NotNil(t, api.reflector.Spec.Components.Schemas)
	schemas := api.reflector.Spec.Components.Schemas.MapOfSchemaOrRefValues
	mappings := 0
	for name, entry := range schemas {
		if entry.Schema == nil || entry.Schema.Discriminator == nil {
			continue
		}
		variants := make(map[string]bool)
		for _, variant := range entry.Schema.OneOf {
			if variant.SchemaReference != nil {
				variants[variant.SchemaReference.Ref] = true
			}
		}
		for value, ref := range entry.Schema.Discriminator.Mapping {
			mappings++
			t.Run(name+"/"+value, func(t *testing.T) {
				const prefix = "#/components/schemas/"
				require.True(t, strings.HasPrefix(ref, prefix), "expected local schema reference: %s", ref)
				_, exists := schemas[strings.TrimPrefix(ref, prefix)]
				require.True(t, exists, "discriminator target does not exist: %s", ref)
				require.True(t, variants[ref], "discriminator target is not a oneOf variant: %s", ref)
			})
		}
	}
	require.Positive(t, mappings, "expected to validate discriminator mappings")
}
