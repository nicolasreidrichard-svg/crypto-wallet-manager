/**
 * Configuration for a single blockchain network.
 */
export interface ChainConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    isTestnet: boolean;
}

/**
 * Supported chain identifiers.
 */
export type ChainId =
    | 'ethereum'
    | 'polygon'
    | 'bsc'
    | 'arbitrum'
    | 'optimism'
    | 'sepolia';

/**
 * Multi-chain RPC configuration. Custom RPC endpoints can be provided
 * via environment variables (e.g. ETH_RPC_URL, POLYGON_RPC_URL, …).
 */
export const chains: Record<ChainId, ChainConfig> = {
    ethereum: {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl:
            Deno.env.get('ETH_RPC_URL') ||
            'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        isTestnet: false,
    },
    polygon: {
        name: 'Polygon Mainnet',
        chainId: 137,
        rpcUrl: Deno.env.get('POLYGON_RPC_URL') || 'https://polygon-rpc.com/',
        isTestnet: false,
    },
    bsc: {
        name: 'BNB Smart Chain Mainnet',
        chainId: 56,
        rpcUrl:
            Deno.env.get('BSC_RPC_URL') || 'https://bsc-dataseed.binance.org/',
        isTestnet: false,
    },
    arbitrum: {
        name: 'Arbitrum One',
        chainId: 42161,
        rpcUrl:
            Deno.env.get('ARBITRUM_RPC_URL') || 'https://rpc.ankr.com/arbitrum',
        isTestnet: false,
    },
    optimism: {
        name: 'Optimism Mainnet',
        chainId: 10,
        rpcUrl:
            Deno.env.get('OPTIMISM_RPC_URL') ||
            'https://opt-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
        isTestnet: false,
    },
    sepolia: {
        name: 'Sepolia Testnet',
        chainId: 11155111,
        rpcUrl:
            Deno.env.get('SEPOLIA_RPC_URL') ||
            'https://rpc.sepolia.org',
        isTestnet: true,
    },
};

/**
 * Returns the configuration for a given chain ID.
 * @param chain - The chain identifier.
 * @returns The ChainConfig for the requested chain.
 */
export function getChainConfig(chain: ChainId): ChainConfig {
    return chains[chain];
}

/**
 * Returns the list of supported chain identifiers.
 */
export function getSupportedChains(): ChainId[] {
    return Object.keys(chains) as ChainId[];
}
