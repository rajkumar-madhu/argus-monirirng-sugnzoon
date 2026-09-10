package user

import "github.com/your-org/argus/pkg/factory"

type Service interface {
	factory.ServiceWithHealthy
}
