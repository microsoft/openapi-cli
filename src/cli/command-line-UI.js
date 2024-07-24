import prompts from "prompts";

export class CommandLineUI {
    constructor(requestor, endpoints) {
        this.requestor = requestor;
        this.endpoints = endpoints
    }

    async run() {
        const endpoint = await this.renderEndpointOptions();
        const parameters = await this.renderParameterOptions(endpoint);

        const result = await this.requestor.request(endpoint, parameters)
        await this.renderResults(result);
    }

    async renderEndpointOptions() {
        const options = []
        for (let endpoint in this.endpoints) {
            options.push({
                title: endpoint, value: this.endpoints[endpoint]
            })
        }

        const response = await prompts({
            "type": 'select',
            "name": "endpoint",
            "message": "Select an endpoint",
            "choices": options,
            "initial": 0
        })

        return response.endpoint;
    }

    async renderParameterOptions(endpoint) {
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
        if (response.ok) {
            console.log(response.status, response.statusText)
            const jsonResult = await response.json()

            console.log(JSON.stringify(jsonResult, null, 2))
        } else {
            console.log(response.status, response.statusText)
        }

    }
}
