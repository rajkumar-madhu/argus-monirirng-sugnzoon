package logspipeline

import "github.com/your-org/argus/pkg/statsreporter"

type Module interface {
	statsreporter.StatsCollector
}
