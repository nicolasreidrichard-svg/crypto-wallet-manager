class PortfolioTracker {
    private assets: Record<string, Record<string, number>>;

    constructor() {
        this.assets = {};
    }

    addAsset(chain: string, token: string, amount: number): void {
        if (!this.assets[chain]) {
            this.assets[chain] = {};
        }
        if (!this.assets[chain][token]) {
            this.assets[chain][token] = 0;
        }
        this.assets[chain][token] += amount;
    }

    getPortfolioSummary(): Record<string, Record<string, number>> {
        const summary: Record<string, Record<string, number>> = {};
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