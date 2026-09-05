import { createConfig } from "@ponder/core";
import { http, parseAbiItem } from "viem";

import { BasedRickLaunchpadAbi } from "./abis/BasedRickLaunchpad";
import { BasedRickMarketplaceAbi } from "./abis/MarketplaceAbi";
import { LaunchpadFactoryAbi } from "./abis/FactoryAbi";

export const LAUNCHPAD_FACTORY_ADDRESS =
  "0x253FC033d3639A2d1df017685dB4837aC8C34a2B" as `0x${string}`;

export const MARKETPLACE_ADDRESS =
  "0x588E5805e3Db9e42F4669a016D9d248F365b2db2" as `0x${string}`;

export const LAUNCHPAD_IMPLEMENTATION_ADDRESS =
  "0xBC5bE44D2BA497c8dD07Ca382252b882CBee569e" as `0x${string}`;

export default createConfig({
  networks: {
    baseSepolia: { chainId: 84532, transport: http(process.env.PONDER_RPC_URL_84532) },
  },
  contracts: {
    LaunchpadFactory: {
      network: "baseSepolia",
      abi: LaunchpadFactoryAbi,
      address: "0x253FC033d3639A2d1df017685dB4837aC8C34a2B", 
      startBlock: 45796720, 
    },
    BasedRickLaunchpad: {
      network: "baseSepolia",
      abi: BasedRickLaunchpadAbi,
      factory: {
        address: "0xBC5bE44D2BA497c8dD07Ca382252b882CBee569e", 
        event: parseAbiItem("event CollectionLaunched(address indexed collectionAddress, address indexed owner, string name, string symbol)"),
        parameter: "collectionAddress",
      },
      startBlock: 45796719, 
    },
    BasedRickMarketplace: {
      network: "baseSepolia",
      abi: BasedRickMarketplaceAbi,
      address: "0x588E5805e3Db9e42F4669a016D9d248F365b2db2", 
      startBlock: 45774287, 
    },
  },
});