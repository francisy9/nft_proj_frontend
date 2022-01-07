import './styles/App.css';
import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import nft_contract from "./utils/nft_contract.json"

// Constants
// const OPENSEA_LINK = 'https://rinkeby.rarible.com/tokens/';
const TOTAL_MINT_COUNT = 50;
const contractAddress = "0xc166b9840551c0A9B3ac54fEA4f5b67305419f76";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");

  const checkWalletConnection = async() => {
    const {ethereum} = window;

    if (ethereum) {
      console.log("eth object found");
    } else {
      console.log("no eth object found");
      return;
    }

    let chainId = await ethereum.request({method: "eth_chainId"});
    console.log("connected to chain" + chainId);

    const rinkbeyChainId = "0x4";
    if(chainId !== rinkbeyChainId) {
      alert("You are not connected to the Rinkey Test Network");
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      setCurrentAccount(accounts[0]);
      console.log(currentAccount);

      setUpEventListener();
    } else {
      console.log("no authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("Get metamask");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      
    } catch (error) {
      console.log(error);
    }
  }

  const setUpEventListener = () => {
    try {
      console.log("setting up event listener");
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, nft_contract.abi, signer);


        connectedContract.on("NFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`# ${tokenId + 1}/${TOTAL_MINT_COUNT} nft. but will take up to 10 minutes to be displayed on: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`);
        })
      } else {
        console.log("Eth object not found");
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMint = async() => {

    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, nft_contract.abi, signer);

        console.log("Going to pop wallet to pay gas...");
        let nftTxn = await connectedContract.makeNFT();

        alert("Minting...");
        await nftTxn.wait();

        console.log("Minted, see transaction: https://rinkeby.etherscan.io/tx/" + nftTxn.hash);
        

      } else {
        console.log("No eth object found");
      }

    } catch(error) {
      console.log(error);
    }
  }


  // Render methods
  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  };

  const renderConnectedContainer = () => {
    return <button onClick={askContractToMint} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  }

  useEffect(() => {
    checkWalletConnection();
  },[])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {(currentAccount === "") ? renderNotConnectedContainer() : renderConnectedContainer()}
        </div>
        <div className="open-sea-container">
          <a href={"https://testnets.opensea.io/collection/square-nft-mqihkgsras"} target={"_blank"}>🌊 View Collection on OpenSea</a>
        </div>
        <div className="footer-container">
        </div>
      </div>
    </div>
  );
};

export default App;
