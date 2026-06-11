import { describe, expect, it } from 'vitest';

import { config, getTokenFingerprint, tokenOverrideStorage } from '@/config';

describe('token-override', () => {
    it('config returns original values without overrides', () => {
        expect(config.github?.access_token).toBeUndefined();
        expect(config.cache.type).toBeDefined();
    });

    it('config returns overridden values inside AsyncLocalStorage', async () => {
        const overrides = { 'github.access_token': 'ghp_test_token_123' };
        const result = await tokenOverrideStorage.run(overrides, () => {
            expect(config.github?.access_token).toBe('ghp_test_token_123');
            // Non-overridden values should still work
            expect(config.cache.type).toBeDefined();
            return 'done';
        });
        expect(result).toBe('done');
    });

    it('config returns original values after AsyncLocalStorage exits', () => {
        // After the run() call above, overrides should be gone
        expect(config.github?.access_token).toBeUndefined();
    });

    it('nested overrides work', async () => {
        const overrides = {
            'youtube.key': 'AIzaSyTestKey',
            'twitter.auth_token': 'test_auth_token',
        };
        await tokenOverrideStorage.run(overrides, () => {
            expect(config.youtube?.key).toBe('AIzaSyTestKey');
            expect(config.twitter?.auth_token).toBe('test_auth_token');
            // Other twitter fields should be original
            expect(config.twitter?.username).toBeUndefined();
        });
    });

    it('getTokenFingerprint returns empty string without overrides', () => {
        expect(getTokenFingerprint()).toBe('');
    });

    it('getTokenFingerprint returns consistent hash for same overrides', async () => {
        const overrides = { 'github.access_token': 'ghp_test' };
        await tokenOverrideStorage.run(overrides, () => {
            const fp1 = getTokenFingerprint();
            const fp2 = getTokenFingerprint();
            expect(fp1).toBe(fp2);
            expect(fp1).not.toBe('');
        });
    });

    it('getTokenFingerprint returns different hash for different overrides', async () => {
        const fp1 = await tokenOverrideStorage.run({ 'github.access_token': 'ghp_aaa' }, () => getTokenFingerprint());
        const fp2 = await tokenOverrideStorage.run({ 'github.access_token': 'ghp_bbb' }, () => getTokenFingerprint());
        expect(fp1).not.toBe(fp2);
    });
});
