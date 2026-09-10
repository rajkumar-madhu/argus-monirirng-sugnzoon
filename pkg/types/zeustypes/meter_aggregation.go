package zeustypes

import "github.com/your-org/argus/pkg/valuer"

type MeterAggregation struct {
	valuer.String
}

var (
	MeterAggregationSum = MeterAggregation{valuer.NewString("sum")}
	MeterAggregationMax = MeterAggregation{valuer.NewString("max")}
)
