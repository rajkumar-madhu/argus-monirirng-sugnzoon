package meterreporter

import (
	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/factory"
)

var (
	ErrCodeInvalidInput = errors.MustNewCode("meterreporter_invalid_input")
)

type Reporter interface {
	factory.ServiceWithHealthy
}
