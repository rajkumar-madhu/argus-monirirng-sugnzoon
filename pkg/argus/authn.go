package argus

import (
	"context"

	"github.com/your-org/argus/pkg/authn"
	"github.com/your-org/argus/pkg/authn/callbackauthn/googlecallbackauthn"
	"github.com/your-org/argus/pkg/authn/passwordauthn/emailpasswordauthn"
	"github.com/your-org/argus/pkg/factory"
	"github.com/your-org/argus/pkg/global"
	"github.com/your-org/argus/pkg/licensing"
	"github.com/your-org/argus/pkg/types/authtypes"
)

func NewAuthNs(ctx context.Context, providerSettings factory.ProviderSettings, store authtypes.AuthNStore, licensing licensing.Licensing, globalConfig global.Config) (map[authtypes.AuthNProvider]authn.AuthN, error) {
	emailPasswordAuthN := emailpasswordauthn.New(store)

	googleCallbackAuthN, err := googlecallbackauthn.New(ctx, store, providerSettings, globalConfig)
	if err != nil {
		return nil, err
	}

	return map[authtypes.AuthNProvider]authn.AuthN{
		authtypes.AuthNProviderEmailPassword: emailPasswordAuthN,
		authtypes.AuthNProviderGoogle:        googleCallbackAuthN,
	}, nil
}
