import Logger from "../utils/logger.ts";

export interface ProfitReport {
    ethereum: number;
    solana: number;
    timestamp: string;
}

export interface ProfitFunnelConfig {
    repositories: string[];
    checkIntervalMs: number;
    ethereumProfitThreshold: number;
    solanaProfitThreshold: number;
    ethereumWalletAddress: string;
    solanaWalletAddress: string;
    githubToken?: string;
    infuraApiKey?: string;
    solanaRpcUrl?: string;
}

export interface AggregatedProfits {
    ethereum: number;
    solana: number;
}

interface IPortfolioTracker {
    addAsset(chain: string, token: string, amount: number): void;
    getPortfolioSummary(): Record<string, Record<string, number>>;
}

class ProfitFunnelTool {
    private config: ProfitFunnelConfig;
    private portfolioTracker: IPortfolioTracker;
    private intervalId: number | undefined;
    private accumulatedProfits: AggregatedProfits;
    private lastSeenTimestamps: Record<string, string>;

    constructor(config: ProfitFunnelConfig, portfolioTracker: IPortfolioTracker) {
        this.config = config;
        this.portfolioTracker = portfolioTracker;
        this.intervalId = undefined;
        this.accumulatedProfits = { ethereum: 0, solana: 0 };
        this.lastSeenTimestamps = {};
    }

    async fetchProfitReport(repo: string): Promise<ProfitReport | null> {
        const url =
            `https://raw.githubusercontent.com/${repo}/main/profit-report.json`;
        try {
            const headers: Record<string, string> = { "Accept": "application/json" };
            if (this.config.githubToken) {
                headers["Authorization"] = `token ${this.config.githubToken}`;
            }
            const response = await fetch(url, { headers });
            if (!response.ok) {
                Logger.warn(
                    `Failed to fetch profit report from ${repo}: HTTP ${response.status}`,
                );
                return null;
            }
            const data = await response.json() as ProfitReport;
            return data;
        } catch (error) {
            Logger.error(`Error fetching profit report from ${repo}: ${error}`);
            return null;
        }
    }

    async aggregateProfits(): Promise<AggregatedProfits> {
        const totals: AggregatedProfits = { ethereum: 0, solana: 0 };
        for (const repo of this.config.repositories) {
            const report = await this.fetchProfitReport(repo);
            if (report) {
                const lastSeen = this.lastSeenTimestamps[repo];
                if (lastSeen && report.timestamp <= lastSeen) {
                    Logger.debug(`No new profit report from ${repo} since ${lastSeen}`);
                    continue;
                }
                totals.ethereum += report.ethereum ?? 0;
                totals.solana += report.solana ?? 0;
                this.lastSeenTimestamps[repo] = report.timestamp;
                Logger.log(
                    `Fetched profits from ${repo}: ETH=${report.ethereum}, SOL=${report.solana}`,
                );
            }
        }
        return totals;
    }

    recordProfits(profits: AggregatedProfits): void {
        if (profits.ethereum > 0) {
            try {
                Logger.log(
                    `Recording ${profits.ethereum} ETH to ${this.config.ethereumWalletAddress}`,
                );
                this.portfolioTracker.addAsset("ethereum", "ETH", profits.ethereum);
            } catch (error) {
                Logger.error(`Failed to record ETH profits: ${error}`);
            }
        }
        if (profits.solana > 0) {
            try {
                Logger.log(
                    `Recording ${profits.solana} SOL to ${this.config.solanaWalletAddress}`,
                );
                this.portfolioTracker.addAsset("solana", "SOL", profits.solana);
            } catch (error) {
                Logger.error(`Failed to record SOL profits: ${error}`);
            }
        }
    }

    async checkAndProcess(): Promise<void> {
        Logger.log("Checking profit reports from monitored repositories...");
        const profits = await this.aggregateProfits();
        this.accumulatedProfits.ethereum += profits.ethereum;
        this.accumulatedProfits.solana += profits.solana;

        Logger.log(
            `Accumulated profits: ETH=${this.accumulatedProfits.ethereum}, SOL=${this.accumulatedProfits.solana}`,
        );

        const toRecord: AggregatedProfits = { ethereum: 0, solana: 0 };

        if (this.accumulatedProfits.ethereum >= this.config.ethereumProfitThreshold) {
            toRecord.ethereum = this.accumulatedProfits.ethereum;
            this.accumulatedProfits.ethereum = 0;
        }
        if (this.accumulatedProfits.solana >= this.config.solanaProfitThreshold) {
            toRecord.solana = this.accumulatedProfits.solana;
            this.accumulatedProfits.solana = 0;
        }

        if (toRecord.ethereum > 0 || toRecord.solana > 0) {
            Logger.log("Profit threshold reached. Recording profits...");
            this.recordProfits(toRecord);
        }
    }

    start(): void {
        if (this.intervalId !== undefined) {
            Logger.warn("ProfitFunnelTool is already running.");
            return;
        }
        Logger.log(
            `ProfitFunnelTool started. Checking every ${this.config.checkIntervalMs}ms.`,
        );
        this.intervalId = setInterval(() => {
            this.checkAndProcess().catch((error) => {
                Logger.error(`Error during profit check: ${error}`);
            });
        }, this.config.checkIntervalMs);
    }

    stop(): void {
        if (this.intervalId !== undefined) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            Logger.log("ProfitFunnelTool stopped.");
        }
    }

    getAccumulatedProfits(): AggregatedProfits {
        return { ...this.accumulatedProfits };
    }
}

export default ProfitFunnelTool;
