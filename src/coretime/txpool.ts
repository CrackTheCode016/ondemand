import { PolkadotClient } from "polkadot-api";
import { CoretimeOrderState, OnDemandConfiguration } from "./types";
import { CoretimeOrderingStrategy } from "./strategy";

export class TxPoolOrderingStrategy extends CoretimeOrderingStrategy {

    constructor(
        protected client: PolkadotClient,
        protected config: OnDemandConfiguration,
        protected state: CoretimeOrderState) {
        super(client, config, state);
    }

    async start(): Promise<void> {
        console.log(`Watching transaction pool for ${this.config.maxTransactions} transactions...`);
        console.log("Ordering initial block...")
        await this.tryOrderCoretime();
        setInterval(async () => {
            if (!this.state.ordering && !this.state.coreInQueue) {
                const ext = await this.client._request("author_pendingExtrinsics", []);
                console.log(`Transaction pool size: ${ext.length}`);
                if (ext.length >= this.config.maxTransactions) {
                    await this.tryOrderCoretime()
                }
            }
        }, this.config.checkIntervalMs);

    }
}