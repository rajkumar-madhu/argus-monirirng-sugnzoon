package inframonitoringtypes

import (
	"github.com/your-org/argus/pkg/valuer"
)

type ResponseType struct {
	valuer.String
}

var (
	ResponseTypeList        = ResponseType{valuer.NewString("list")}
	ResponseTypeGroupedList = ResponseType{valuer.NewString("grouped_list")}
)

func (ResponseType) Enum() []any {
	return []any{
		ResponseTypeList,
		ResponseTypeGroupedList,
	}
}
