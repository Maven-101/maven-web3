// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract DeployKYCRegistry is Script {
    function run() external returns (KYCRegistry) {
        vm.startBroadcast();
        KYCRegistry kycRegistry = new KYCRegistry();
        vm.stopBroadcast();

        return kycRegistry;
    }
}
