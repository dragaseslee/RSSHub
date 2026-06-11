import type { MiddlewareHandler } from 'hono';

import { type TokenOverrideMap, tokenOverrideStorage } from '@/config';

const HEADER_PREFIX = 'x-rsshub-';

/**
 * Parse X-RSSHub-{Service}-{Key} headers into config path overrides.
 *
 * Header format: X-RSSHub-{Service}-{Property}
 *   - Service: maps to config key (lowercase), e.g., "github" → config.github
 *   - Property: maps to config field, hyphens become underscores
 *     e.g., "access-token" → config.github.access_token
 *
 * Examples:
 *   X-RSSHub-Github-Token → config.github.token
 *   X-RSSHub-Github-Access-Token → config.github.access_token
 *   X-RSSHub-Twitter-Auth-Token → config.twitter.auth_token
 *   X-RSSHub-Youtube-Key → config.youtube.key
 *   X-RSSHub-Bilibili-Cookie → config.bilibili.cookie
 *   X-RSSHub-Ehentai-Ipb-Member-Id → config.ehentai.ipb_member_id
 */
function parseTokenHeaders(headers: Record<string, string | undefined>): TokenOverrideMap {
    const overrides: TokenOverrideMap = {};

    for (const [name, value] of Object.entries(headers)) {
        if (!name.startsWith(HEADER_PREFIX) || !value) {
            continue;
        }

        const rest = name.slice(HEADER_PREFIX.length);
        const dashIndex = rest.indexOf('-');
        if (dashIndex === -1) {
            continue;
        }

        const service = rest.slice(0, dashIndex);
        const key = rest.slice(dashIndex + 1).replaceAll('-', '_');

        if (service && key) {
            overrides[`${service}.${key}`] = value;
        }
    }

    return overrides;
}

const middleware: MiddlewareHandler = async (ctx, next) => {
    const headers = ctx.req.header();
    const overrides = parseTokenHeaders(headers);

    Object.keys(overrides).length > 0 ? await tokenOverrideStorage.run(overrides, next) : await next();
};

export default middleware;
