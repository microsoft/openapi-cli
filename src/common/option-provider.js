import {program} from "commander";
import prompts from "prompts";

export class OptionProvider {
    getOptions() {
        return program
            .requiredOption('-s, --spec <string>', 'URL or path to the OpenAPI spec')
            .option('-a, --audience <string>', 'Audience for the token')
            .option('-b, --base-url <string>', 'Base URL for the API')
            .option('-w, --web', 'Use web UI')
            .parse()
            .opts();
    }

    async promptEnvironmentSelection(environments) {
        const options = []
        for (let environment in environments) {
            options.push({
                title: environment,
                value: environment
            })
        }

        const response = await prompts({
            "type": 'select',
            "name": "environment",
            "message": "Select an environment",
            "choices": options,
            "initial": 0
        })

        return response.environment;
    }
}
