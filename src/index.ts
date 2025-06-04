// `dot` is the name we gave to `npx papi add`
import { polkadot } from "@polkadot-api/descriptors"
import { PolkadotClient } from "polkadot-api"
import { CoretimeOrderState, OrderingMode } from "./coretime/types";
import { CoretimeOrderingStrategy } from "./coretime/strategy";
import { BlockOrderingStrategy } from "./coretime/block";
import { TxPoolOrderingStrategy } from "./coretime/txpool";
import { getRelayChainUrl, parseConfiguration, withWebSocket } from "./helper";

function watchCoretimeQueue(
    relayChainClient: PolkadotClient,
    parachainId: number) {
    const relayChainApi = relayChainClient.getTypedApi(polkadot);
    return relayChainApi.query.OnDemand.ParaIdAffinity.watchValue(parachainId);
}

// Main function to watch the relay chain and parachain and order coretime based on the mode
export async function watch(configPath: string, mode: OrderingMode): Promise<void> {
    const config = await parseConfiguration(configPath);
    console.log(`Configuration loaded for parachain ${config.parachainId}, ordering from ${config.relayChain}...`);
    console.log(`Ordering Mode: ${mode}`);

    const relayChainUrl = await getRelayChainUrl(config.relayChain);
    const orderingState: CoretimeOrderState = {
        ordering: false,
        coreInQueue: false,
        blockCounter: 0,
    }

    const wsRelayChainClient = await withWebSocket(relayChainUrl);
    watchCoretimeQueue(wsRelayChainClient, config.parachainId).subscribe((result) => {
        console.log("Watching coretime queue...");
        if (result) {
            console.log(`Core ${result.core_index} being used`);
        } else {
            console.log(`Core no longer in use.`);
            orderingState.coreInQueue = false;
        }
    })

    let strategy: CoretimeOrderingStrategy;
    // Choose the ordering strategy based on the mode
    if (mode === OrderingMode.Block) {
        strategy = new BlockOrderingStrategy(wsRelayChainClient, config, orderingState)
    } else if (mode === OrderingMode.TransactionPool) {
        const wsParachainClient = await withWebSocket(config.parachainRpcUrls);
        strategy = new TxPoolOrderingStrategy(wsParachainClient, config, orderingState);
    } else {
        throw new Error("Unknown ordering mode");
    }

    await strategy.start();
}