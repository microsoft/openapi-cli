export class SpecParser {
    hasEnvironmentConfigs(spec) {
        return !!spec.environments;
    }

    async parseSpec(spec, options, environment = null) {
        const {baseUrl, audience} = this.getEnvironment(spec, options, environment);
        if (baseUrl == null) throw new Error("Failed to determine base URL");
        if (audience == null) throw new Error("Failed to determine audience");

        const endpoints = {};
        for (let endpoint in spec.paths) {
            for (let method in spec.paths[endpoint]) {
                const key = `${method.toUpperCase()} ${endpoint}`
                endpoints[key] = {
                    ...spec.paths[endpoint][method],
                    url: baseUrl + endpoint,
                    method,
                    audience
                }
            }
        }

        return endpoints;
    }

    getEnvironment(spec, options, environment = null) {
        if (environment != null && !!spec.environments) {
            return spec.environments[environment];
        }

        return {
            "baseUrl": options.baseUrl || this.getBaseUrl(options.spec),
            "audience": options.audience
        }
    }

    getBaseUrl(path) {
        try {
            const parsedUrl = new URL(path);
            return parsedUrl.hostname;
        } catch {
            return null;
        }
    }

}
