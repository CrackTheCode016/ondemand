// `dot` is the name we gave to `npx papi add`
import { polkadot } from "@polkadot-api/descriptors"
import { createClient, PolkadotClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { OnDemandConfiguration, OrderingMode } from "./types";
import fs from "fs";
import { getPolkadotSigner } from "polkadot-api/signer";
import { ed25519, sr25519 } from "@polkadot-labs/hdkd-helpers";
import { fromHex } from "polkadot-api/utils";

async function withWebSocket(url: string): Promise<PolkadotClient> {
    return createClient(
        withPolkadotSdkCompat(
            getWsProvider(url)
        )
    );
}

async function parseConfiguration(path: string): Promise<OnDemandConfiguration> {
    // Read the configuration file
    const file = await fs.promises.readFile(path, "utf-8");
    return JSON.parse(file);
}

async function getRelayChainUrl(relayChain: string): Promise<string> {
    // Map the relay chain name to its corresponding WebSocket URL
    const relayChainUrls: { [key: string]: string } = {
        kusama: "wss://kusama-rpc.polkadot.io",
        polkadot: "wss://polkadot.api.onfinality.io/public-ws",
        westend: "wss://westend.api.onfinality.io/public-ws",
        paseo: "wss://paseo.rpc.amforc.com:443",
    };
    // Check if the relay chain is supported
    if (!relayChainUrls[relayChain]) {
        throw new Error(`Unsupported relay chain: ${relayChain}`);
    }
    // Return the WebSocket URL for the specified relay chain  
    return relayChainUrls[relayChain];
}

async function orderCoretime(
    relayChainClient: PolkadotClient,
    parachainId: number,
    maxAmount: number,
    privateKey: string) {

    const hexPrivateKey = fromHex(privateKey);
    const account = getPolkadotSigner(
        ed25519.getPublicKey(hexPrivateKey),
        "Ed25519",
        (input) => ed25519.sign(input, hexPrivateKey)
    );

    const relayChainApi = relayChainClient.getTypedApi(polkadot);
    return relayChainApi.tx.OnDemand.place_order_keep_alive(
        {
            para_id: parachainId,
            max_amount: BigInt(maxAmount)
        }
    ).signSubmitAndWatch(account);
}

// Main function to watch the relay chain and parachain and order coretime based on the mode
export async function watch(configPath: string, mode: OrderingMode): Promise<void> {
    // Parse the configuration file
    const config = await parseConfiguration(configPath);
    console.log(`Configuration loaded for parachain ${config.parachainId}, ordering from ${config.relayChain}...`);
    console.log(`Ordering Mode: ${mode}`);

    const relayChainUrl = await getRelayChainUrl(config.relayChain);
    let maxBlockCounter = 0;
    let currentlyOrdering = false;
    console.log(`Connecting to relay chain: ${config.relayChain}`);
    // Create a client to connect to the relay chain
    const wsParachainClient = await withWebSocket(config.parachainRpcUrl);
    // Get the WebSocket URL for the specified relay chain
    const wsRelayChainClient = await withWebSocket(relayChainUrl);

    if (mode === OrderingMode.Block) {
        wsRelayChainClient.finalizedBlock$.subscribe(async (block) => {
            // Check if the block is a finalized block
            console.log(`New finalized block: ${block.number}`);
            maxBlockCounter++;
            // Check if the current block number is greater than the maximum allowed blocks
            if (maxBlockCounter > config.maxBlocks && !currentlyOrdering) {
                currentlyOrdering = true;
                console.log(`Time to order more coretime!`);
                // Call the function to order coretime
                (await orderCoretime(wsRelayChainClient, config.parachainId, config.maxAmount, config.accountPrivateKey)).subscribe((result) => {
                    if (result.type === "finalized") {
                        console.log(`Coretime order finalized: ${result.txHash}`);
                        console.log(`Parachain: ${config.parachainId}`);
                        maxBlockCounter = 0;
                        currentlyOrdering = false;
                    }
                });
            }
        })
    } else if (mode === OrderingMode.TransactionPool) {
        console.log(`Watching transaction pool...`);
        setInterval(async () => {
            // Check the transaction pool every 10 seconds
            const ext = await wsParachainClient._request("author_pendingExtrinsics", []);
            console.log(`Transaction pool size: ${ext.length}`);
            if (ext.length >= config.maxTransactions && !currentlyOrdering) {
                console.log(`Time to order more coretime!`);
                currentlyOrdering = true;
                (await orderCoretime(wsRelayChainClient, config.parachainId, config.maxAmount, config.accountPrivateKey)).subscribe((result) => {
                    if (result.type === "finalized") {
                        console.log(`Coretime order finalized: ${result.txHash}`);
                        console.log(`Parachain: ${config.parachainId}`);
                        currentlyOrdering = false;
                    }
                });
            }
        }, 10000);
    }
}