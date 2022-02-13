import { HardhatUserConfig } from "hardhat/config";
import { task } from "hardhat/config";
import { HttpNetworkUserConfig } from "hardhat/types"
import "@nomiclabs/hardhat-ethers"
import { HDKey as hdkey } from 'ethereum-cryptography/hdkey'
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
const bip39 = require("bip39")
const EthUtil = require("ethereumjs-util")

require('dotenv').config()

const mnemonic = process.env.MNEMONIC

task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(await account.address);
    }
});

task("account", "Get balance informations for the deployment account.")
    .addParam("count", "the number of accounts to print", "20")
    .setAction(async (params, { ethers, }) => {
        //   const hdkey = require("ethereumjs-wallet/hdkey")
        const accounts = await ethers.getSigners();
        // const { deployer } = await ethers.getSigners()
        const seed = await bip39.mnemonicToSeed(mnemonic)
        const hdwallet = hdkey.fromMasterSeed(seed)

        // const wallet_hdpath = "m/44'/60'/0'/0/"
        // const idx = 0

        // generate wallet path
        // generate account index
        let sum = BigNumber.from(0)
        let resultsPromise = []
        console.log('deployer=', accounts[0].address)
        for (let idx = 0; idx < params.count; idx++) {

            const wallet1 = ethers.Wallet.fromMnemonic(mnemonic!, `m/44'/60'/0'/0/${idx}`,)
            // console.log(wallet1.address, wallet1.privateKey)
            const path = `m/44'/60'/0'/0/${idx}`
            const wallet = hdwallet.derive(path)
            const privateKey = `0x${wallet.privateKey?.toString("hex")}`
            const address = `0x${EthUtil.privateToAddress(wallet.privateKey).toString("hex")}`
            const balance = await ethers.provider.getBalance(address)
            sum = sum.add(balance)
            console.log(`${idx} ${formatEther(sum)} ${address} ${formatEther(balance)}`)
            let value: BigNumber = balance.mul(98).div(100)
            const tx = wallet1.connect(ethers.provider).sendTransaction({
                to: accounts[0].address,
                value: value,
                gasLimit: 21000,
            })
            resultsPromise.push(tx);
            // ethers.provider.send


            // console.log(path, `Account ${idx}`, address, privateKey)
            // console.log(ethers.provider)
            // const provider = new ethers.providers.JsonRpcProvider(ethers.provider.url)
            // const balance = await provider.getBalance(address)
        }

        Promise.allSettled(resultsPromise).then(results => { console.log('all done') })


        // derive wallet

        // console.log(`‍📬 Deployer Account is ${address}`)
        // for (const n in config.networks) {
        //     try {
        //         const { url } = config.networks[n] as HttpNetworkUserConfig
        //         const provider = new ethers.providers.JsonRpcProvider(url)
        //         const balance = await provider.getBalance(address)
        //         console.log(` -- ${n} --  -- -- 📡 `)
        //         console.log(`   balance: ${ethers.utils.formatEther(balance)}`)
        //         console.log(`   nonce: ${await provider.getTransactionCount(address)}`)
        //         console.log(`   url: ${url}`)
        //     } catch (e: any) {
        //         console.log(`${n} ${e.reason}`)
        //     }
        // }
    })

const config: HardhatUserConfig = {
    solidity: '0.7.3',
    networks: {
        localhost: {
            url: 'http://localhost:8545',
            accounts: {
                mnemonic: mnemonic
            }
        },
        mumbai: {
            url: "https://matic-mumbai.chainstacklabs.com",
            chainId: 80001,
            gasPrice: 8000000000,
            gas: 9500000,
            accounts: {
                mnemonic: mnemonic
            }
        }
    }
}

export default config;