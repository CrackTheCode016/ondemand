// `dot` is the name we gave to `npx papi add`
import { assethub, custom } from "@polkadot-api/descriptors"
import { createClient, PolkadotClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { chainSpec } from "polkadot-api/chains/polkadot_asset_hub";
import { chainSpec as relayChainSpec } from "polkadot-api/chains/polkadot";
import { start } from "polkadot-api/smoldot";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

async function withLightClient(): Promise<PolkadotClient> {
    // Start the light client
    const smoldot = start();
    // The Polkadot Relay Chain
    const relayChain = await smoldot.addChain({ chainSpec: relayChainSpec })
    // Polkadot AssetHub - we include the relay chain as a "potential relay chain", as this is part of smoldot to check the chainspec for what relay chain a parachain uses
    const assetHub = await smoldot.addChain({ chainSpec, potentialRelayChains: [relayChain] });
    // Combine it and make a client!
    return createClient(
        getSmProvider(assetHub)
    );
}
async function withWebSocket(url: string): Promise<PolkadotClient> {
    return createClient(
        // Polkadot-SDK Nodes have issues, we recommend adding this enhancer
        // see Requirements page for more info
        withPolkadotSdkCompat(
            getWsProvider("ws://localhost:9944")
        )
    );
}

async function main() {
    // For custom chain options, uncomment the following and add your custom URL (such as: localhost). You may also comment out the above client in this case.
    const wsClient = await withWebSocket("ws://localhost:9944");
    const lightClient = await withLightClient();

    // To interact with the chain, you need to get the `TypedApi`, which includes
    // all the types for every call in that chain:

    // Note, if you want to use a custom chain, you must change it to the name of the metadata from PAPI (see README for more details).
    // You must also use the "wsClient" instead.
    const dotApi = lightClient.getTypedApi(assethub);
    // For example, with a custom chain:
    // const dotApi = wsClient.getTypedApi(custom);

    // Then, you can make calls like this...
    const last_runtime_upgrade = await dotApi.query.System.LastRuntimeUpgrade.getValue();
    console.log(last_runtime_upgrade)
}

main()