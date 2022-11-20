import { Injectable } from "@nestjs/common"
import { ethers } from "ethers"
import { readFileSync } from "fs-extra"

import * as myERC20TokenJson from "./assets/MyERC20Votes.json"
import * as ballotJson from "./assets/TokenizedBallot.json"
import * as contract_addresses from "./assets/contract-addresses.json"

const ERC20VOTES_ADDRESS = contract_addresses.ERC20VOTES_ADDRESS
const BALLOT_ADDRESS = contract_addresses.BALLOT_ADDRESS

const encryptedJson =
    readFileSync("./encrypted-publicTest.json", "utf8") || "emptry"
let PRIVATE_KEY: string
const PASSWORD: string = process.env.WAL_PASS || "No pass provided"

if (PASSWORD != "No pass provided") {
    PRIVATE_KEY = ethers.Wallet.fromEncryptedJsonSync(
        encryptedJson,
        PASSWORD,
    ).privateKey
} else {
    PRIVATE_KEY =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}

export class RequestTokensDTO {
    "to": string
    "counter": string
    "signature": string
}

@Injectable()
export class AppService {
    provider: ethers.providers.Provider
    wallet: ethers.Wallet
    tokenContract: ethers.Contract
    ballotContract: ethers.Contract
    abiCoder: ethers.utils.AbiCoder

    counterTokenRequest: number

    constructor() {
        this.provider = ethers.providers.getDefaultProvider("goerli", {
            etherscan: process.env.ETHERSCAN_API_KEY,
            infura: process.env.INFURA_API_KEY,
            alchemy: process.env.ALCHEMY_API_KEY,
            pocket: process.env.POCKET_API_KEY,
        })
        this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider)
        this.tokenContract = new ethers.Contract(
            ERC20VOTES_ADDRESS,
            myERC20TokenJson.abi,
            this.wallet,
        )
        this.ballotContract = new ethers.Contract(
            BALLOT_ADDRESS,
            ballotJson.abi,
            this.wallet,
        )
        this.abiCoder = new ethers.utils.AbiCoder()
        this.counterTokenRequest = 0
    }

    getTokenAddress(): string {
        return this.tokenContract.address
    }

    getBallotAddress(): string {
        return this.ballotContract.address
    }

    getCounterTokenRequest(): number {
        return this.counterTokenRequest
    }

    requestTokens(
        requestTokensDTO: RequestTokensDTO,
    ): any {
        const messageHash = ethers.utils.keccak256(
            this.abiCoder.encode(
                ["address", "uint256"],
                [requestTokensDTO.to, this.counterTokenRequest],
            ),
        )
        const expectedSigner = ethers.utils.verifyMessage(
            messageHash,
            requestTokensDTO.signature,
        )

        if (expectedSigner === requestTokensDTO.to) {
            this.tokenContract
                .mint(requestTokensDTO.to, 1)
                .then((txResponse: ethers.ContractTransaction): ethers.ContractTransaction => {
                    this.counterTokenRequest += 1
                    return txResponse
                })
        }
    }
}
