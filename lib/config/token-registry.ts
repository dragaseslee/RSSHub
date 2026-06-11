import type { TokenRequirement } from '@/errors/types/config-not-found';

/**
 * Central registry of token requirements for each service.
 * Routes can reference these when throwing ConfigNotFoundError.
 *
 * Key: service name (matches config key, e.g., "github", "spotify")
 */
const tokenRegistry: Record<string, TokenRequirement[]> = {
    github: [
        {
            configPath: 'github.access_token',
            header: 'X-RSSHub-Github-Token',
            envVar: 'GITHUB_ACCESS_TOKEN',
            description: 'GitHub Personal Access Token (classic or fine-grained)',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    gitee: [
        {
            configPath: 'gitee.access_token',
            header: 'X-RSSHub-Gitee-Token',
            envVar: 'GITEE_ACCESS_TOKEN',
            description: 'Gitee Personal Access Token',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    twitter: [
        {
            configPath: 'twitter.authToken',
            header: 'X-RSSHub-Twitter-AuthToken',
            envVar: 'TWITTER_AUTH_TOKEN',
            description: 'Twitter auth_token cookie (comma-separated for multiple)',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    spotify: [
        {
            configPath: 'spotify.clientId',
            header: 'X-RSSHub-Spotify-ClientId',
            envVar: 'SPOTIFY_CLIENT_ID',
            description: 'Spotify API Client ID',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
        {
            configPath: 'spotify.clientSecret',
            header: 'X-RSSHub-Spotify-ClientSecret',
            envVar: 'SPOTIFY_CLIENT_SECRET',
            description: 'Spotify API Client Secret',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
        {
            configPath: 'spotify.refreshToken',
            header: 'X-RSSHub-Spotify-RefreshToken',
            envVar: 'SPOTIFY_REFRESHTOKEN',
            description: 'Spotify OAuth Refresh Token (required for private playlists)',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    youtube: [
        {
            configPath: 'youtube.key',
            header: 'X-RSSHub-Youtube-Key',
            envVar: 'YOUTUBE_KEY',
            description: 'YouTube Data API v3 Key (comma-separated for rotation)',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    pixiv: [
        {
            configPath: 'pixiv.refreshToken',
            header: 'X-RSSHub-Pixiv-RefreshToken',
            envVar: 'PIXIV_REFRESHTOKEN',
            description: 'Pixiv OAuth Refresh Token',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    telegram: [
        {
            configPath: 'telegram.token',
            header: 'X-RSSHub-Telegram-Token',
            envVar: 'TELEGRAM_TOKEN',
            description: 'Telegram Bot Token',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    bilibili: [
        {
            configPath: 'bilibili.cookie.*',
            header: 'X-RSSHub-Bilibili-Cookie-{UID}',
            envVar: 'BILIBILI_COOKIE_{UID}',
            description: 'Bilibili SESSDATA cookie (key by UID, supports multiple)',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    douban: [
        {
            configPath: 'douban.cookie',
            header: 'X-RSSHub-Douban-Cookie',
            envVar: 'DOUBAN_COOKIE',
            description: 'Douban login cookie',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    zhihu: [
        {
            configPath: 'zhihu.cookies',
            header: 'X-RSSHub-Zhihu-Cookies',
            envVar: 'ZHIHU_COOKIES',
            description: 'Zhihu login cookies',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    ehentai: [
        {
            configPath: 'ehentai.ipb_member_id',
            header: 'X-RSSHub-Ehentai-Ipb-Member-Id',
            envVar: 'EHENTAI_IPB_MEMBER_ID',
            description: 'E-Hentai forum member ID cookie',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
        {
            configPath: 'ehentai.ipb_pass_hash',
            header: 'X-RSSHub-Ehentai-Ipb-Pass-Hash',
            envVar: 'EHENTAI_IPB_PASS_HASH',
            description: 'E-Hentai forum password hash cookie',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
        {
            configPath: 'ehentai.sk',
            header: 'X-RSSHub-Ehentai-Sk',
            envVar: 'EHENTAI_SK',
            description: 'E-Hentai forum sk cookie',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    instagram: [
        {
            configPath: 'instagram.cookie',
            header: 'X-RSSHub-Instagram-Cookie',
            envVar: 'INSTAGRAM_COOKIE',
            description: 'Instagram login cookie',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    xiaoyuzhou: [
        {
            configPath: 'xiaoyuzhou.token',
            header: 'X-RSSHub-Xiaoyuzhou-Token',
            envVar: 'XIAOYUZHOU_TOKEN',
            description: 'Xiaoyuzhou (Small Universe) API token',
            required: true,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    ncm: [
        {
            configPath: 'ncm.cookies',
            header: 'X-RSSHub-Ncm-Cookies',
            envVar: 'NCM_COOKIES',
            description: 'NetEase Cloud Music cookies',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
    weibo: [
        {
            configPath: 'weibo.cookie',
            header: 'X-RSSHub-Weibo-Cookie',
            envVar: 'WEIBO_COOKIE',
            description: 'Weibo login cookie',
            required: false,
            docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
        },
    ],
};

export default tokenRegistry;

/**
 * Get token requirements for a service, with header names derived from config paths.
 */
export function getTokenRequirements(service: string): TokenRequirement[] {
    return tokenRegistry[service] || [];
}

/**
 * Generate header name from config path.
 * e.g., "github.access_token" → "X-RSSHub-Github-Token"
 */
export function configPathToHeader(configPath: string): string {
    const [service, ...rest] = configPath.split('.');
    const key = rest.join('-').replaceAll('_', '-');
    return `X-RSSHub-${service.charAt(0).toUpperCase() + service.slice(1)}-${key
        .split('-')
        .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
        .join('-')}`;
}
