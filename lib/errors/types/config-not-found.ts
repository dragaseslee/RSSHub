export interface TokenRequirement {
    /** Config path, e.g., "github.access_token" */
    configPath: string;
    /** HTTP header name for per-request override, e.g., "X-RSSHub-Github-Token" */
    header: string;
    /** Environment variable name, e.g., "GITHUB_ACCESS_TOKEN" */
    envVar: string;
    /** Human-readable description */
    description: string;
    /** Whether this token is required (true) or optional (false) */
    required: boolean;
    /** URL to documentation */
    docsUrl?: string;
}

class ConfigNotFoundError extends Error {
    name = 'ConfigNotFoundError';
    tokenRequirements: TokenRequirement[];

    constructor(message: string, tokenRequirements: TokenRequirement[] = []) {
        super(message);
        this.tokenRequirements = tokenRequirements;
    }
}

export default ConfigNotFoundError;
