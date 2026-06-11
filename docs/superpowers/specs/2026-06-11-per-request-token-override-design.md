# Per-Request Token Override Design

## Problem

RSSHub reads all API tokens from environment variables at startup, stored in a global `config` singleton. In a multi-user shared instance, different users need to use their own tokens for the same service (e.g., different GitHub tokens). Currently this is impossible without deploying separate instances.

## Goal

Allow users to pass their own API tokens via HTTP headers on a per-request basis. The token overrides the environment variable for that request only. Zero modifications to existing route code.

## Approach: AsyncLocalStorage + Proxy

### Architecture

```
Request → [token-override middleware]
            ↓ Parse X-RSSHub-{Service}-{Key} headers
            ↓ Store in AsyncLocalStorage
          [Route handler]
            ↓ config.github.access_token
            ↓ Proxy intercepts → check AsyncLocalStorage → use override or fallback to env value
```

### Files Changed

| File                                    | Change Type | Lines Changed     |
| --------------------------------------- | ----------- | ----------------- |
| `lib/middleware/token-override.ts`      | NEW         | ~60 lines         |
| `lib/middleware/token-override.test.ts` | NEW         | ~50 lines (tests) |
| `lib/config.ts`                         | MODIFY      | ~30 lines         |
| `lib/app-bootstrap.tsx`                 | MODIFY      | ~2 lines          |
| `lib/middleware/cache.ts`               | MODIFY      | ~3 lines          |

### Header Naming Convention

```
X-RSSHub-{Service}-{Property}: value

Examples:
  X-RSSHub-Github-Token: ghp_xxxx
  X-RSSHub-Youtube-Key: AIzaSyxxx
  X-RSSHub-Bilibili-Cookie: SESSDATA=xxx
  X-RSSHub-Twitter-AuthToken: abc123
```

Service name is case-insensitive, matched against config key (lowercase). Property name maps to the config field name.

### Proxy Mechanism

The exported `config` object is wrapped in a deep Proxy:

1. Property access at any level checks AsyncLocalStorage for overrides
2. If an override exists for the full path (e.g., `github.access_token`), return the override value
3. Otherwise, fall back to the original config value
4. Nested objects (e.g., `config.github`) return a new Proxy that continues the chain

### Cache Isolation

- Cache key includes a fingerprint (SHA-256 hash, truncated to 16 chars) of all overridden tokens
- Different users with different tokens get separate cache entries
- Users without token overrides share the default cache (no performance penalty)

### Security

- Intended for self-hosted instances behind authentication
- Tokens are passed via HTTP headers (not in URL/logs)
- No token validation — RSSHub trusts the middleware; the third-party API validates the token
- Operators should use HTTPS to protect tokens in transit

### Limitations

- Only works for simple string/boolean config values
- Dynamic prefix configs (BILIBILI*COOKIE*_, DISCOURSE*CONFIG*_) require special handling in the middleware
- Comma-separated multi-token fields (YouTube keys, Twitter auth tokens) — the header overrides the entire field, not individual tokens within it
