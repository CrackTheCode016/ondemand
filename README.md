# On Demand Ordering

Ondemand is a CLI tool for ordering on-demand coretime for parachains on supported relay chains. It monitors chain activity and automatically places coretime orders based on configurable criteria.

## Getting Started

Clone the repository and install dependencies:

```sh
bun install
```

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed. Alternatively, `yarn` or `npm` can also be used:

```sh
curl -fsSL https://bun.sh/install | bash
```

## Usage

Run the CLI to start monitoring and ordering coretime:

- `--config <path>`: Path to your configuration JSON file (default: `./config.json`)
- `--mode <mode>`: Ordering mode, either `block` or `transaction_pool` (default: `block`)

Order coretime when a maximum number of blocks have passed without parachain activity:

```sh
bun run ondemand:block
```

Order coretime when the transaction pool reaches a certain size:

```sh
bun run ondemand:txpool
```

## Configuration

Create a `config.json` file with the following structure:

```json
{
  "relayChain": "polkadot",
  "parachainRpcUrls": ["wss://your-parachain-node:9944"],
  "maxBlocks": 10,
  "accountMnemonic": "your mnemonic phrase here",
  "maxAmount": 1000000000,
  "maxTransactions": 20,
  "parachainId": 2000,
  "checkIntervalMs": 5000
}
```

- `relayChain`: Supported values are `polkadot`, `kusama`, `westend`, `rococo`, `paseo`
- `parachainRpcUrls`: Array of WebSocket URLs for your parachain node(s)
- `maxBlocks`: Maximum number of relay chain blocks before ordering coretime (used in `block` mode)
- `accountMnemonic`: Mnemonic for the account that will pay for coretime
- `maxAmount`: Maximum amount to spend per coretime order
- `maxTransactions`: Maximum transactions in the pool before ordering (used in `txpool` mode)
- `parachainId`: Numeric parachain ID
- `checkIntervalMs`: Interval (ms) to check the transaction pool

## Notes on Forking with On-Demand

If your parachain is forking with the use of this tool, you will need to enable `slot-based` authoring for your collator(s): 

```
--authoring slot-based
```

With async backing (or `--authoring lookahead`), collators may produce two blocks in a row, but due to the nature of coretime, the second block gets abandoned.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.