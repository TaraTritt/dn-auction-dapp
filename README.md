# dn-auction-dapp
This repo is built on top of the [dapp-starter repo](https://github.com/TaraTritt/dapp-starter). It shows you how you can extend that repo to create a more complex Ethereum DApp.

The purpose of this DApp is to auction off [Discount Notes](https://www.investopedia.com/terms/d/discountnote.asp)

## Prerequisites

Install to your computer:

* [Node.js (LTS is fine)](https://nodejs.org/en/)
  * If you already have node installed, make sure you have at least version 8.0.0 >= of Node.js. You can check your node version by running this command: 
```node
node -v
```

Install to your browser:

* [Metamask](https://chrome.google.com/webstore/search/metamask)
  * After installing, create an account 
  * Make sure you select the Rinkeby Test Network from the top left corner of the extension - by default the Main Ethereum Network will be selected

Navigate to and follow the directions below for the following:

* [Rinkeby Ethereum Faucet](https://faucet.rinkeby.io/)
  * Copy your address from MetaMask by opening up the extension and clicking the ... and then selecting the option "Copy Address to clipboard"
  * Follow the instructions on the Faucet webpage to get your Ether and choose the 18.75 ethers option
  * This faucet will give you Ether for free on the Rinkeby Test Network. This will come in handy later when you are interacting with the DApp

- [Infura](https://infura.io/)
  * Sign up for Infura at https://infura.io/, you should recieve an email will all the public ethereum networks - save the Rinkeby Test Provider URL for later
  * This url will allow you to connect to a node provided by Infura, which is required to interact with any Ethereum Network

## Getting Started

### Install Dependencies

**If you are on a Windows computer, please execute this command as an [administrator](https://www.howtogeek.com/194041/how-to-open-the-command-prompt-as-administrator-in-windows-8.1/) below first:**

```shell
npm install --global --production windows-build-tools
```

1.  Install dependencies with npm

```shell
npm install
```

2. If you want to view all the functionality, including the Auction Factory Manager functionality, you also need to deploy another instance of the Auction Factory contract, else skip to [step 4]().

3. Compile the contracts by executing ethereum/compile.js. **Make sure to execute this command inside the ethereum directory**

```shell
node compile.js
```

* This will generate .json files for each contract in DNAuction.sol under the ethereum/build folder


4.  Modify ethereum/web3.js to use your Infura Rinkeby Provider URL, which will be the default provider for web3.js if the user does not have MetaMask installed, otherwise it will use the MetaMask injected provider

```javascript
const provider = new Web3.providers.HttpProvider(
  "<Infura Provider URL with Access Key>"
);
```

5. Run your app locally on port 3000. **Make sure to execute this command from the root directory of your project**

```shell
npm start
```


