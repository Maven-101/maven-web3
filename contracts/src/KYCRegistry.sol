// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KYCRegistry {
    error Already_Registered();
    error Not_Registered();

    event Registered(
        address indexed user,
        bytes32 facialFeatureHash,
        bytes32 CIDHash
    );

    mapping(address user => bytes32 facialFeatureHash)
        private s_facialFeatureHashes;
    mapping(address user => bytes32 CIDHash) private s_cidHashes;

    function register(bytes32 facialFeatureHash, bytes32 CIDHash) public {
        if (s_facialFeatureHashes[msg.sender] != 0) {
            revert Already_Registered();
        }
        s_facialFeatureHashes[msg.sender] = facialFeatureHash;
        s_cidHashes[msg.sender] = CIDHash;

        emit Registered(msg.sender, facialFeatureHash, CIDHash);
    }

    function getFacialFeatureHash(address user) public view returns (bytes32) {
        if (s_facialFeatureHashes[user] == 0) {
            revert Not_Registered();
        }
        return s_facialFeatureHashes[user];
    }

    function getCIDHash(address user) public view returns (bytes32) {
        if (s_cidHashes[user] == 0) {
            revert Not_Registered();
        }
        return s_cidHashes[user];
    }
}
