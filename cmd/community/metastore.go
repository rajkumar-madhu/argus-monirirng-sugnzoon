package main

import (
	"github.com/your-org/argus/pkg/argus"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/sqlschema"
	"github.com/your-org/argus/pkg/sqlstore"
)

func sqlstoreProviderFactories() factory.NamedMap[factory.ProviderFactory[sqlstore.SQLStore, sqlstore.Config]] {
	return argus.NewSQLStoreProviderFactories()
}

func sqlschemaProviderFactories(sqlstore sqlstore.SQLStore) factory.NamedMap[factory.ProviderFactory[sqlschema.SQLSchema, sqlschema.Config]] {
	return argus.NewSQLSchemaProviderFactories(sqlstore)
}
