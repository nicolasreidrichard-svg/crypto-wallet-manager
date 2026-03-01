class PortfolioTracker {
    constructor() {
        this.assets = {};
    }

    addAsset(chain, token, amount) {
        if (!this.assets[chain]) {
            this.assets[chain] = {};
        }
        if (!this.assets[chain][token]) {
            this.assets[chain][token] = 0;
        }
        this.assets[chain][token] += amount;
    }

    getPortfolioSummary() {
        let summary = {};
        for (const chain in this.assets) {
            summary[chain] = {};
            for (const token in this.assets[chain]) {
                summary[chain][token] = this.assets[chain][token];
            }
        }
        return summary;
    }
}

export default PortfolioTracker;