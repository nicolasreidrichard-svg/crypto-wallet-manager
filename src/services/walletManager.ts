import { ethers } from 'ethers';

class WalletManager {
    constructor() {
        this.wallets = {};
    }

    createWallet(chain) {
        const wallet = ethers.Wallet.createRandom();
        this.wallets[chain] = wallet;
        return wallet;
    }

    importWallet(chain, privateKey) {
        const wallet = new ethers.Wallet(privateKey);
        this.wallets[chain] = wallet;
        return wallet;
    }

    async getBalance(chain) {
        if (!this.wallets[chain]) throw new Error('Wallet not found for chain: ' + chain);
        const provider = ethers.getDefaultProvider(chain);
        const balance = await provider.getBalance(this.wallets[chain].address);
        return ethers.utils.formatEther(balance);
    }
}

export default WalletManager;