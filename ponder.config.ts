import { createConfig } from "ponder";
import { http } from "viem";
import { baseSepolia } from "viem/chains";

// You will need to drop your ABIs into a local folder, e.g., `./abis/FactoryAbi.ts`
import { FACTORY_ABI } from "./abis/FactoryAbi";
import { MARKETPLACE_ABI } from "./abis/MarketplaceAbi";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: baseSepolia.id,
      // You can use the public node here, but Alchemy/QuickNode is highly recommended for indexers
      transport: http(process.env.PONDER_RPC_URL_84532 || "https://sepolia.base.org"),
    },
  },
  contracts: {
    LaunchpadFactory: {
      network: "baseSepolia",
      abi: FACTORY_ABI,
      address: "0x253FC033d3639A2d1df017685dB4837aC8C34a2B",
      startBlock: 45796720, // The exact block you deployed the factory
    },
    Marketplace: {
      network: "baseSepolia",
      abi: MARKETPLACE_ABI,
      // Insert your actual Marketplace contract address here
      address: "0xYOUR_MARKETPLACE_ADDRESS_HERE", 
      startBlock: 45796720,
    }
  },
});