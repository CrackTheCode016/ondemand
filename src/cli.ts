import { program } from "commander";
import { watch } from "./index";
import { OrderingMode } from "./coretime/types";
import { parseConfiguration } from "./helper";

program.version("0.0.1")
    .description("CLI for ordering on-demand coretime for parachains")
    .option("-c, --config <path>", "Path to the configuration file", "./config.json")
    .option("-m, --mode <mode>", "Ordering mode: block or transaction_pool", "block")
    .parse(process.argv);

const options = program.opts();
const mode = options.mode as OrderingMode;

parseConfiguration(options.config).then((config) => {
    return watch(config, mode)
}).then(() => {
    console.log("Configuration successfully loaded. Watching both chains for new blocks...");
}).catch((error: any) => {
    console.error("Error starting service:", error);
}
);