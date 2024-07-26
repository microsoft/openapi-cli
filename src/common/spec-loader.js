import fetch from "node-fetch";
import fs from "fs";

export class SpecLoader {
    async load(options) {
        if (!options.spec) throw new Error("Spec location is required")

        let spec = this.isWebPath(options.spec) ? await this.loadWebSpec(options.spec) : await this.loadLocalSpec(options.spec);
        if (!spec) throw new Error("Failed to load spec.")

        return spec;
    }

    isWebPath(path) {
        return path.startsWith('http');
    }

    async loadWebSpec(path) {
        try {
            const response = await fetch(path);

            return await response.json();
        } catch (ex) {
            throw new Error(`Failed to load spec from: ${path}`)
        }
    }

    async loadLocalSpec(path) {
        return new Promise((resolve, reject) => {
            path = !path.endsWith('.json') ? path + '.json' : path;

            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading the file:', err);
                    reject(err)

                    return;
                }

                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    console.error('Error parsing JSON:', parseErr);
                    reject(parseErr);
                }
            });
        })
    }

}

