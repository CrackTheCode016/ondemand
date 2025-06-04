import { createClient, PolkadotClient } from "polkadot-api";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { OnDemandConfiguration } from "./coretime/types";
import { RELAY_CHAIN_URLS } from "./relay_urls";
import fs from "fs";
import { polkadot } from "@polkadot-api/descriptors";

export async function withWebSocket(url: string[]): Promise<PolkadotClient> {
    return createClient(
        withPolkadotSdkCompat(
            getWsProvider(url)
        )
    );
}

export async function parseConfiguration(path: string): Promise<OnDemandConfiguration> {
    // Read the configuration file
    const file = await fs.promises.readFile(path, "utf-8");
    return JSON.parse(file);
}

export async function getRelayChainUrl(relayChain: string): Promise<string[]> {
    // Map the relay chain name to its corresponding WebSocket URL
    // Check if the relay chain is supported
    if (!RELAY_CHAIN_URLS[relayChain]) {
        throw new Error(`Unsupported relay chain: ${relayChain}`);
    }
    // Return the WebSocket URL for the specified relay chain  
    return RELAY_CHAIN_URLS[relayChain];
}

export function watchCoretimeQueue(
    relayChainClient: PolkadotClient,
    parachainId: number) {
    const relayChainApi = relayChainClient.getTypedApi(polkadot);
    return relayChainApi.query.OnDemand.ParaIdAffinity.watchValue(parachainId);
}