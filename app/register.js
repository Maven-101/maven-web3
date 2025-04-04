import { ethers } from "ethers";

const register = async (facialFeaturesHash, cidHash) => {
  try {
    if (!window.ethereum) {
      alert("Metamask not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.send("eth_requestAccounts", []);
    const addresses = await provider.listAccounts();
    const address = addresses[0].address;
    console.log("Connected account:", address);
    const signer = await provider.getSigner();

    const contractABI = [
      {
        type: "function",
        name: "getCIDHash",
        inputs: [
          {
            name: "user",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [
          {
            name: "",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "getFacialFeatureHash",
        inputs: [
          {
            name: "user",
            type: "address",
            internalType: "address",
          },
        ],
        outputs: [
          {
            name: "",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
        stateMutability: "view",
      },
      {
        type: "function",
        name: "register",
        inputs: [
          {
            name: "facialFeatureHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "CIDHash",
            type: "bytes32",
            internalType: "bytes32",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
      {
        type: "event",
        name: "Registered",
        inputs: [
          {
            name: "user",
            type: "address",
            indexed: true,
            internalType: "address",
          },
          {
            name: "facialFeatureHash",
            type: "bytes32",
            indexed: false,
            internalType: "bytes32",
          },
          {
            name: "CIDHash",
            type: "bytes32",
            indexed: false,
            internalType: "bytes32",
          },
        ],
        anonymous: false,
      },
      {
        type: "error",
        name: "Already_Registered",
        inputs: [],
      },
      {
        type: "error",
        name: "Not_Registered",
        inputs: [],
      },
    ];
    const contractAddress = "0x";

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.register(facialFeaturesHash, cidHash);

    const filterAppEventsByCaller = contract.filters.Registered(address);
    contract.on(filterAppEventsByCaller, () => {
      console.log("Registered successfully");
    });
  } catch (error) {
    console.error(error);
  }
};

export default register;
