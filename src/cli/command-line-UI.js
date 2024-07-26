import prompts from "prompts";

export class CommandLineUI {
    constructor(requestor, endpoints) {
        this.requestor = requestor;
        this.endpoints = endpoints
    }

    async run() {
        const endpoint = await this.promptEndpointOptions();
        const parameters = await this.promptParameterOptions(endpoint);

        const result = await this.requestor.request(endpoint, parameters)
        await this.renderResults(result);
    }

    async promptEndpointOptions() {
        const options = []
        for (let endpoint in this.endpoints) {
            options.push({
                title: endpoint, value: this.endpoints[endpoint]
            })
        }

        const response = await prompts({
            "type": 'autocomplete',
            "name": "endpoint",
            "message": "Select an endpoint",
            "choices": options,
            "initial": 0
        })

        return response.endpoint;
    }

    async promptParameterOptions(endpoint) {
        if (!endpoint.parameters || endpoint.parameters.length === 0) return {};

        const questions = [ ]
        for (let param of endpoint.parameters) {
            questions.push({
                type: 'text',
                name: `${param.name}`,
                message: `Enter ${param.name} ${param.required ? '(required)' : ''}`,
            });
        }

        return prompts(questions);
    }

    async renderResults(response) {
        console.log(response.status, response.statusText) ;
        if (response.status === 204) {
            return;
        }

        try {
            const jsonResult = await response.json()

            console.log(JSON.stringify(jsonResult, null, 2))
        } catch {
            console.log('The response is not JSON or failed to parse.')
        }
    }
}
