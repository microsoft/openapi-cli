import fetch from "node-fetch";

export class Requester {
    constructor(tokenProvider, accessToken = null) {
        this.tokenProvider = tokenProvider;
        this.accessToken = accessToken;
    }

    async request(endpoint, parameters) {
        let url = endpoint.url;
        for (let param in parameters)  {
            url = url.replace(`{${param}}`, parameters[param]);
        }

        console.log("Requesting", endpoint.method.toUpperCase(), url);

        return await fetch(url, {
            method: endpoint.method,
            headers: {
                Authorization: `Bearer ${this.accessToken || await this.tokenProvider.getToken(endpoint.audience)}`
            }
        });
    }
}
