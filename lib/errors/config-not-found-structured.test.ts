import { describe, expect, it } from 'vitest';

import ConfigNotFoundError from '@/errors/types/config-not-found';

describe('ConfigNotFoundError structured response', () => {
    it('should carry token requirements', () => {
        const requirements = [
            {
                configPath: 'github.access_token',
                header: 'X-RSSHub-Github-Token',
                envVar: 'GITHUB_ACCESS_TOKEN',
                description: 'GitHub Personal Access Token',
                required: false,
                docsUrl: 'https://docs.rsshub.app/deploy/config#route-specific-configurations',
            },
        ];
        const error = new ConfigNotFoundError('GitHub token required', requirements);

        expect(error.name).toBe('ConfigNotFoundError');
        expect(error.message).toBe('GitHub token required');
        expect(error.tokenRequirements).toHaveLength(1);
        expect(error.tokenRequirements[0].configPath).toBe('github.access_token');
        expect(error.tokenRequirements[0].header).toBe('X-RSSHub-Github-Token');
        expect(error.tokenRequirements[0].envVar).toBe('GITHUB_ACCESS_TOKEN');
        expect(error.tokenRequirements[0].required).toBe(false);
    });

    it('should default to empty requirements', () => {
        const error = new ConfigNotFoundError('Some error');
        expect(error.tokenRequirements).toEqual([]);
    });

    it('should support multiple token requirements', () => {
        const requirements = [
            {
                configPath: 'spotify.clientId',
                header: 'X-RSSHub-Spotify-ClientId',
                envVar: 'SPOTIFY_CLIENT_ID',
                description: 'Spotify API Client ID',
                required: true,
            },
            {
                configPath: 'spotify.clientSecret',
                header: 'X-RSSHub-Spotify-ClientSecret',
                envVar: 'SPOTIFY_CLIENT_SECRET',
                description: 'Spotify API Client Secret',
                required: true,
            },
            {
                configPath: 'spotify.refreshToken',
                header: 'X-RSSHub-Spotify-RefreshToken',
                envVar: 'SPOTIFY_REFRESHTOKEN',
                description: 'Spotify OAuth Refresh Token',
                required: false,
            },
        ];
        const error = new ConfigNotFoundError('Spotify config required', requirements);
        expect(error.tokenRequirements).toHaveLength(3);
        expect(error.tokenRequirements.filter((r) => r.required)).toHaveLength(2);
        expect(error.tokenRequirements.filter((r) => !r.required)).toHaveLength(1);
    });
});
