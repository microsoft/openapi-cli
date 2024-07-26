import {AzureCliCredential} from '@azure/identity';

export class AzureCLITokenProvider {
    constructor() {
        this.credential = new AzureCliCredential();
    }

    async getToken(resource) {
        const result = await this.credential.getToken(resource);

        return result.token;
    }
}

