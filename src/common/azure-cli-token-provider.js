import {AzureCliCredential} from '@azure/identity';

export class AzureCLITokenProvider {
    credential = null;

    constructor() {
        this.credential = new AzureCliCredential();
    }

    async getToken(resource) {
        const cred = new AzureCliCredential();
        const result = await cred.getToken(resource);

        return result.token;
    }
}

