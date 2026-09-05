import { createConfig } from "ponder";
import { http } from "viem";

import { FACTORY_ABI } from "./abis/FactoryAbi";
import { MARKETPLACE_ABI } from "./abis/MarketplaceAbi";

export default createConfig({
  chains: {
    baseSepolia: {
      id: 84532,
      rpc: http(process.env.PONDER_RPC_URL_84532),
    },
  },
  contracts: {
  LaunchpadFactory: {
    abi: FACTORY_ABI,
    chain: "baseSepolia",
    address: "0x253FC033d3639A2d1df017685dB4837aC8C34a2B", 
    startBlock: 45774287, // <-- Paste Factory block here
  },
  BasedRickMarketplace: {
    abi: MARKETPLACE_ABI,
    chain: "baseSepolia",
    address: "0x588E5805e3Db9e42F4669a016D9d248F365b2db2", 
    startBlock: 45774287 , // <-- Paste Marketplace block here
  },
}
});