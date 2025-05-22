// Supported relay chains
export enum RelayChain {
    Kusama = "kusama",
    Polkadot = "polkadot",
    Westend = "westend",
    Rococo = "rococo",
    Paseo = "paseo",
}

export enum OrderingMode {
    // The user wants to order coretime after a certain number of blocks
    Block = "block",
    // The user wants to order coretime after a certain amount of transactions in the pool are existent
    TransactionPool = "txpool",
}

// Configuration passed into the CLI in the form of a JSON file
export interface OnDemandConfiguration {
    // The name of the relay chain you want to connect to
    relayChain: RelayChain;
    // The name of the parachain you want to connect to
    parachainRpcUrls: string[];
    // The maximum number of blocks that the relaychain can advance without the parachain ever producing a block
    maxBlocks: number;
    // The private key of the account that will hold the funds on the relay chain to execute the purchase of the onDemand coretime
    accountPrivateKey: string;
    // How much is the user willing to spend at most for having one more block validated on the relay chain
    maxAmount: number;
    // The maximum number of transactions in the pool before coretime is ordered
    maxTransactions: number;
    // Parachain ID
    parachainId: number;
    // The interval in ms to check the transaction pool
    checkIntervalMs: number;
}
