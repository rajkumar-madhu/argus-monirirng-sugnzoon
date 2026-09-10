package cachetest

import (
	"context"

	"github.com/your-org/argus/pkg/cache"
	"github.com/your-org/argus/pkg/cache/memorycache"
	"github.com/your-org/argus/pkg/factory/factorytest"
)

func New(config cache.Config) (cache.Cache, error) {
	cache, err := memorycache.New(context.TODO(), factorytest.NewSettings(), config)
	if err != nil {
		return nil, err
	}

	return cache, nil
}
