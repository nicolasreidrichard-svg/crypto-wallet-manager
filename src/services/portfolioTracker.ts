/**
 * Thrown when an asset removal would result in a negative balance.
 */
export class InsufficientBalanceError extends Error {
    constructor(chain: string, token: string, available: number, requested: number) {
        super(
            `Insufficient balance for ${token} on ${chain}: ` +
            `available ${available}, requested ${requested}`
        );
        this.name = 'InsufficientBalanceError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class PortfolioTracker {
    private assets: Record<string, Record<string, number>>;
    /** USD prices per token symbol (e.g. { ETH: 3000, USDC: 1 }). */
    private prices: Record<string, number>;

    constructor() {
        this.assets = {};
        this.prices = {};
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

    /**
     * Deducts the given amount of a token on a chain (i.e. records a spend).
     * @param chain - The chain identifier.
     * @param token - The token symbol.
     * @param amount - The amount to deduct.
     * @throws {InsufficientBalanceError} If the available balance is less than the requested amount.
     */
    removeAsset(chain: string, token: string, amount: number): void {
        const available = this.assets[chain]?.[token] ?? 0;
        if (amount > available) {
            throw new InsufficientBalanceError(chain, token, available, amount);
        }
        this.assets[chain][token] = available - amount;
    }

    /**
     * Sets the USD price for a token symbol.
     * @param token - The token symbol (e.g. "ETH").
     * @param priceUsd - The token price in USD.
     */
    setAssetPrice(token: string, priceUsd: number): void {
        this.prices[token] = priceUsd;
    }

    /**
     * Calculates the total USD value of the portfolio based on prices set via
     * {@link setAssetPrice}. Tokens without a price are treated as zero-value.
     * @returns The total portfolio value in USD.
     */
    getPortfolioValue(): number {
        let total = 0;
        for (const chain in this.assets) {
            for (const token in this.assets[chain]) {
                const price = this.prices[token] ?? 0;
                total += this.assets[chain][token] * price;
            }
        }
        return total;
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
export { PortfolioTracker };