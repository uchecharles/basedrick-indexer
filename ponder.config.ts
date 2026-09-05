import { createConfig, factory } from "ponder";
import { parseAbiItem } from "viem";

import { LaunchpadFactoryAbi } from "./abis/FactoryAbi";
import { BasedRickLaunchpadAbi } from "./abis/BasedRickLaunchpad";
import { BasedRickMarketplaceAbi } from "./abis/MarketplaceAbi";

export default createConfig({
  chains: {
    baseSepolia: { 
      id: 84532, 
      rpc: process.env.PONDER_RPC_URL_84532 
    },
  },
  contracts: {
    LaunchpadFactory: {
      chain: "baseSepolia",
      abi: LaunchpadFactoryAbi,
      address: "0x253FC033d3639A2d1df017685dB4837aC8C34a2B", 
      startBlock: 45796720,
    },
    BasedRickLaunchpad: {
      chain: "baseSepolia",
      abi: BasedRickLaunchpadAbi,
      address: factory({
        address: "0xBC5bE44D2BA497c8dD07Ca382252b882CBee569e",
        event: parseAbiItem("event CollectionLaunched(address indexed collectionAddress, address indexed owner, string name, string symbol)"),
        parameter: "collectionAddress",
      }),
      startBlock: 45796719, 
    },
    BasedRickMarketplace: {
      chain: "baseSepolia",
      abi: BasedRickMarketplaceAbi,
      address: "0x588E5805e3Db9e42F4669a016D9d248F365b2db2",
      startBlock: 45774287, 
    },
  },
});