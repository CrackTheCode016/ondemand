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
import { RELAY_CHAIN_URLS } from "./relay_urls";
import { Observable } from "rxjs";

async function withWebSocket(url: string[]): Promise<PolkadotClient> {
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

async function getRelayChainUrl(relayChain: string): Promise<string[]> {
    // Map the relay chain name to its corresponding WebSocket URL
    // Check if the relay chain is supported
    if (!RELAY_CHAIN_URLS[relayChain]) {
        throw new Error(`Unsupported relay chain: ${relayChain}`);
    }
    // Return the WebSocket URL for the specified relay chain  
    return RELAY_CHAIN_URLS[relayChain];
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
    const config = await parseConfiguration(configPath);
    console.log(`Configuration loaded for parachain ${config.parachainId}, ordering from ${config.relayChain}...`);
    console.log(`Ordering Mode: ${mode}`);

    const relayChainUrl = await getRelayChainUrl(config.relayChain);
    let blockCounter = 0;
    let ordering = false;

    const wsParachainClient = await withWebSocket(config.parachainRpcUrls);
    const wsRelayChainClient = await withWebSocket(relayChainUrl);

    const tryOrderCoretime = async () => {
        ordering = true;
        console.log(`Time to order more coretime!`);
        (await orderCoretime(wsRelayChainClient, config.parachainId, config.maxAmount, config.accountPrivateKey))
            .pipe()
            .subscribe((result) => {
                if (result.type === "finalized") {
                    console.log(`Coretime order finalized: ${result.txHash}`);
                    console.log(`Parachain: ${config.parachainId}`);
                    blockCounter = 0;
                    ordering = false;
                }
            });
    };

    if (mode === OrderingMode.Block) {
        wsRelayChainClient.finalizedBlock$.subscribe(async (block) => {
            console.log(`New finalized block: ${block.number}`);
            blockCounter++;
            if (blockCounter > config.maxBlocks && !ordering) {
                await tryOrderCoretime();
            }
        });
        return;
    }

    if (mode === OrderingMode.TransactionPool) {
        console.log(`Watching transaction pool...`);
        setInterval(async () => {
            const ext = await wsParachainClient._request("author_pendingExtrinsics", []);
            console.log(`Transaction pool size: ${ext.length}`);
            if (ext.length >= config.maxTransactions && !ordering) {
                await tryOrderCoretime();
            }
        }, config.checkIntervalMs);
        return;
    }
}