const uuid = require('uuid/v1');
const {verifySignature} = require('../util');
const {REWARD_INPUT, MINING_REWARD} = require('../config');

class Transaction {
    constructor ({senderWallet, recipient, amount, outputMap, input}) {
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
        this.count = 1;
    }

    createOutputMap({senderWallet, recipient, amount}) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount - 2;

        return outputMap;
    }

    createInput({senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(this.outputMap)
        }
    }

    update({senderWallet, recipient, amount}) {
        if(amount+2>this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        if(!this.outputMap[recipient]) {
            this.outputMap[recipient] = amount;
        } else {
            this.outputMap[recipient] = this.outputMap[recipient] +amount;
        }
        this.count += 1;
        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey]-amount - 2;

        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }

    static validTransaction(transaction) {
        const {input: {address, amount, signature}, outputMap, count} = transaction;

        const outputTotal = Object.values(outputMap)
        .reduce((total, outputAmount) => total+outputAmount);

        if(amount !== (outputTotal+(2*count))) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if(!verifySignature({publicKey: address, data: outputMap, signature})) {
            console.error(`Invalid signature from ${address}`);
            return false;
        }
        return true;
    } 

    static rewardTransaction({minerWallet, totalTransactionCount}) {
        const finalReward = MINING_REWARD + totalTransactionCount*2;
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: finalReward}
        });
    }
}
module.exports = Transaction;