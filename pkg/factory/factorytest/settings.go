package factorytest

import (
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
)

func NewSettings() factory.ProviderSettings {
	return instrumentationtest.New().ToProviderSettings()
}
