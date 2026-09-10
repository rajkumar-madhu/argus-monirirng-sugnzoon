package pprof

import "github.com/your-org/argus/pkg/factory"

// PProf is the interface that wraps the pprof service lifecycle.
type PProf interface {
	factory.Service
}
