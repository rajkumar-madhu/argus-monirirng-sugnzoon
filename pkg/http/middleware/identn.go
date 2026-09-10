package middleware

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/your-org/argus/pkg/errors"
	"github.com/your-org/argus/pkg/identn"
	"github.com/your-org/argus/pkg/sharder"
	"github.com/your-org/argus/pkg/types"
	"github.com/your-org/argus/pkg/types/authtypes"
	"github.com/your-org/argus/pkg/types/ctxtypes"
	"github.com/your-org/argus/pkg/valuer"
)

const (
	identityCrossOrgMessage string = "::IDENTITY-CROSS-ORG::"
)

type IdentN struct {
	resolver identn.IdentNResolver
	sharder  sharder.Sharder
	logger   *slog.Logger
}

func NewIdentN(resolver identn.IdentNResolver, sharder sharder.Sharder, logger *slog.Logger) *IdentN {
	return &IdentN{
		resolver: resolver,
		sharder:  sharder,
		logger:   logger,
	}
}

func (m *IdentN) Wrap(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idn := m.resolver.GetIdentN(r)
		if idn == nil {
			next.ServeHTTP(w, r)
			return
		}

		if pre, ok := idn.(identn.IdentNWithPreHook); ok {
			r = pre.Pre(r)
		}

		identity, err := idn.GetIdentity(r)
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		ctx := r.Context()
		claims := identity.ToClaims()
		if err := m.sharder.IsMyOwnedKey(ctx, types.NewOrganizationKey(valuer.MustNewUUID(claims.OrgID))); err != nil {
			m.logger.ErrorContext(ctx, identityCrossOrgMessage, slog.Any("claims", claims), errors.Attr(err))
			next.ServeHTTP(w, r)
			return
		}

		ctx = authtypes.NewContextWithClaims(ctx, claims)

		comment := ctxtypes.CommentFromContext(ctx)
		comment.Set("identn_provider", claims.IdentNProvider.StringValue())
		comment.Set("user_id", claims.UserID)
		comment.Set("service_account_id", claims.ServiceAccountID)
		comment.Set("principal", claims.Principal.StringValue())
		comment.Set("org_id", claims.OrgID)
		ctx = ctxtypes.NewContextWithComment(ctx, comment)

		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)

		if hook, ok := idn.(identn.IdentNWithPostHook); ok {
			hook.Post(context.WithoutCancel(r.Context()), r, claims)
		}
	})
}
