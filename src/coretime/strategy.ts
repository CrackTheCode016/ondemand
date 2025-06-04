import { PolkadotClient, PolkadotSigner } from "polkadot-api";
import { CoretimeOrderState, OnDemandConfiguration } from "./types";
import { entropyToMiniSecret, mnemonicToEntropy } from "@polkadot-labs/hdkd-helpers";
import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import { getPolkadotSigner } from "polkadot-api/signer";
import { polkadot } from "@polkadot-api/descriptors";

/**
 * Interface for coretime ordering strategies.
 * This interface defines different strategies that can be used to order coretime for a parachain.
 */
export abstract class CoretimeOrderingStrategy {

    /**
     * Constructs a new CoretimeOrderingStrategy.
     * @param client - The Polkadot client used to interact with the blockchain.
     * @param config - The configuration for on-demand coretime ordering.
     * @param state - The current state of the coretime order.
     */
    constructor(
        protected client: PolkadotClient,
        protected config: OnDemandConfiguration,
        protected state: CoretimeOrderState
    ) { }


    /**
     * Extracts a Polkadot signer from the provided mnemonic.
     * @param mnemonic - The mnemonic used to derive the signer.
     * @returns A PolkadotSigner instance derived from the mnemonic.
     */
    protected extractSigner(
        mnemonic: string
    ): PolkadotSigner {
        const entropy = mnemonicToEntropy(mnemonic);
        const miniSecret = entropyToMiniSecret(entropy)
        const derive = sr25519CreateDerive(miniSecret)
        return getPolkadotSigner(
            derive('').publicKey,
            "Sr25519",
            (input) => derive('').sign(input)
        );
    }

    /**
     * Attempts to order coretime for the parachain.
     */
    protected async tryOrderCoretime() {
        this.state.ordering = true;
        this.state.coreInQueue = true;
        console.log(`Time to order more coretime!`);
        const account = await this.extractSigner(this.config.accountMnemonic);
        const relayChainApi = this.client.getTypedApi(polkadot);
        relayChainApi.tx.OnDemand.place_order_keep_alive(
            {
                para_id: this.config.parachainId,
                max_amount: BigInt(this.config.maxAmount)
            }
        )
            .signSubmitAndWatch(account)
            .pipe()
            .subscribe((result) => {
                if (result.type === "finalized") {
                    console.log(`Coretime order finalized: ${result.txHash}`);
                    console.log(`Parachain: ${this.config.parachainId}`);
                    this.state.blockCounter = 0;
                    this.state.ordering = false;
                }
            });
    }

    abstract start(): Promise<void>;

}