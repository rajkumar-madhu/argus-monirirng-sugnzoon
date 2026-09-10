package rediscache

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/go-redis/redismock/v9"
	"github.com/stretchr/testify/assert"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/instrumentation/instrumentationtest"
	"github.com/your-org/argus/pkg/types/cachetypes"
	"github.com/your-org/argus/pkg/valuer"
)

type CacheableA struct {
	Key    string
	Value  int
	Expiry time.Duration
}

func (cacheable *CacheableA) Clone() cachetypes.Cacheable {
	return &CacheableA{
		Key:    cacheable.Key,
		Value:  cacheable.Value,
		Expiry: cacheable.Expiry,
	}
}

func (cacheable *CacheableA) Cost() int64 {
	return int64(len(cacheable.Key)) + 16
}

func (cacheable *CacheableA) MarshalBinary() ([]byte, error) {
	return json.Marshal(cacheable)
}

func (cacheable *CacheableA) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, cacheable)
}

func TestSet(t *testing.T) {
	db, mock := redismock.NewClientMock()
	providerSettings := instrumentationtest.New().ToProviderSettings()
	cache := &provider{client: db, settings: factory.NewScopedProviderSettings(providerSettings, "github.com/your-org/argus/pkg/cache/rediscache")}

	cacheable := &CacheableA{
		Key:    "some-random-key",
		Value:  1,
		Expiry: time.Microsecond,
	}

	orgID := valuer.GenerateUUID()
	mock.ExpectSet(strings.Join([]string{orgID.StringValue(), "key"}, "::"), cacheable, 10*time.Second).SetVal("ok")

	assert.NoError(t, cache.Set(context.Background(), orgID, "key", cacheable, 10*time.Second))
	assert.NoError(t, mock.ExpectationsWereMet())
}
