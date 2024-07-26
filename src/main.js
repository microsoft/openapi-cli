#!/usr/bin/env node

import { OptionProvider } from "./common/option-provider.js";
import { AzureCLITokenProvider } from './common/azure-cli-token-provider.js';
import { Requester } from './common/requester.js';
import { SpecLoader } from "./common/spec-loader.js";
import { SpecParser} from "./common/spec-parser.js";
import { CommandLineUI } from "./cli/command-line-UI.js";

(async () => {
    const optionsProvider = new OptionProvider();
    const specLoader = new SpecLoader();
    const specParser = new SpecParser();
    const azureCLITokenProvider = new AzureCLITokenProvider();
    const options = optionsProvider.getOptions();

    const requester = new Requester(azureCLITokenProvider, options.accessToken);
    const spec = await specLoader.load(options);

    let environment = null;
    if (specParser.hasEnvironmentConfigs(spec)) {
        environment = await optionsProvider.promptEnvironmentSelection(spec.environments);
    }

    const endpoints = await specParser.parseSpec(spec, options, environment);
    const ui = new CommandLineUI(requester, endpoints);
    await ui.run();
})()


