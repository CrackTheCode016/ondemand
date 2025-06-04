import { PolkadotClient } from "polkadot-api";
import { CoretimeOrderState, OnDemandConfiguration } from "./types";
import { CoretimeOrderingStrategy } from "./strategy";


export class BlockOrderingStrategy extends CoretimeOrderingStrategy {


    constructor(
        protected client: PolkadotClient,
        protected config: OnDemandConfiguration,
        protected state: CoretimeOrderState) {
        super(client, config, state);
    }

    async start(): Promise<void> {
        // Implementation for block-based ordering strategy
        this.client.finalizedBlock$.subscribe(async (_) => {
            this.state.blockCounter++;
            if (this.state.blockCounter >= this.config.maxBlocks && !this.state.ordering && !this.state.coreInQueue) {
                await this.tryOrderCoretime();
            }
        });

    }
}