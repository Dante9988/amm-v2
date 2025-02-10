# Automated Market Maker (AMM) Project

This project is an implementation of an Automated Market Maker (AMM) using the Hardhat development environment. It includes smart contracts, tests, and deployment scripts to facilitate decentralized trading.

## Project Structure

- **Contracts**: Smart contracts for the AMM.
- **Scripts**: Deployment scripts for deploying the contracts.
- **Tests**: Unit tests for the smart contracts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Hardhat](https://hardhat.org/)

## Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the root directory and add your configuration settings. For example:

   ```plaintext
   ALCHEMY_API_KEY=your_alchemy_api_key
   PRIVATE_KEY=your_wallet_private_key
   ```

## Usage

### Compile Contracts

Compile the smart contracts using Hardhat:

```bash
npx hardhat compile
```

### Run Tests

Execute the test suite to ensure everything is working correctly:

```bash
npx hardhat test
```

### Deploy Contracts

Deploy the contracts to a local or test network:

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

Replace `<network-name>` with your desired network (e.g., `localhost`, `rinkeby`).

## Tasks

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
