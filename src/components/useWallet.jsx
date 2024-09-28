import  {useEffect, useState} from 'react'
import { ethers } from 'ethers';

const UseWallet = () => {
   const [accounts, setAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [chainId, setChainId] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [balInDec, setBalance] = useState(null);
  const [inputAddress, setInputAddress] = useState('');

  const provider = window.ethereum; 

  useEffect(() =>{
    if(!provider){
        setErrorMessage('No Ethereum wallet detected');
        return;
    }
    provider.on('connect', handleConnect);
    provider.on('disconnect', handleDisconnect);
    provider.on('chainChanged', handleChainChanged);
    provider.on('accountsChanged', handleAccountsChanged);


    checkChainId();
    fetchBalance();
      
    return () => {
       provider.removeListener('connect', handleConnect);
       provider.removeListener('disconnect', handleDisconnect);
       provider.removeListener('chainChanged', handleChainChanged);
       provider.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async()=>{
    try{
        const accounts = await provider.request({method: 'eth_requestAccounts'});
        setAccount(accounts[0]);
        await checkChainId();
        await fetchBalance();
    }catch(err){
        setErrorMessage(err.message);
    }
  }

  const disconnectWallet = () => {
    setAccount(null);
    setChainId('');
    setNetworkName('');
    setErrorMessage('Disconnected');
  }

  const checkChainId = async () => {
    try {
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      const chainIdDec = parseInt(chainIdHex, 16);

      console.log(`Hexadecimal Chain ID: ${chainIdHex}`);
      console.log(`Decimal Chain ID: ${chainIdDec}`);

      if (chainIdHex === '0x1') {
        setChainId(chainIdHex);
        setNetworkName('Ethereum Mainnet');
      } else if (chainIdHex === '0xaa36a7') {
        setChainId(chainIdHex);
        setNetworkName('Sepolia Testnet');
      } else {
        setErrorMessage('Please connect to Sepolia Testnet or Ethereum Mainnet.');
        setChainId(chainIdDec);
        setNetworkName('Unsupported Network');
      }
    } catch (error) {
      console.error(`Error fetching chainId: ${error.code}: ${error.message}`);
      setErrorMessage(`Error fetching chainId: ${error.message}`);
    }
  }

  const getNetworkName = (chainIdHex) =>{
    if(chainIdHex === '0x1'){
        return 'Ethereum Mainnet';
    }else if(chainIdHex === '0xaa36a7'){
        return 'Sepolia Testnet';
    }else{
        return 'Unsupported Network';
    }
  }


  const fetchBalance = async() =>{
    if (!provider || !inputAddress) {
      setErrorMessage('Enter valid address');
      return;
    }
    try{
    //   const balance = await provider.getBalance(inputAddress,"latest");
     const balance = await provider.request({ method: "eth_getBalance", params:[inputAddress,"latest"] });
     const balInDec = ethers.formatEther(balance);
    setBalance(balInDec);
    } catch(err){
        setErrorMessage(`Error fetching balance: ${err.message}`)
    }
  }

  const handleChainChanged = async (chainIdHex) => {
    setChainId(chainIdHex);
    setNetworkName(getNetworkName(chainIdHex));
    setErrorMessage(`Network changed to ${getNetworkName(chainIdHex)}`);
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      disconnectWallet();
    }
  };

  const handleConnect = () => {
    console.log('Wallet connected');
  };

  const handleDisconnect = () => {
    console.log('Wallet disconnected');
    disconnectWallet();
  };

  return  {accounts,
    chainId,
    networkName,
    errorMessage,
    balInDec,
    inputAddress,
    setInputAddress,
    connectWallet,
    disconnectWallet,
    fetchBalance}
}

export default UseWallet



//   const fetchBalance = async () => {
// //   if (!inputAddress || !ethers.utils.isAddress(inputAddress)) {
// //     setErrorMessage('Please enter a valid Ethereum address.');
// //     return;
// //   }

//   try {
//     const provider = window.ethereum;
//     if (!provider) {
//       setErrorMessage('Ethereum provider not found.');
//       return;
//     }

//     // Use eth_getBalance RPC method to get the balance
//     const balanceHex = await provider.request({
//       method: 'eth_getBalance',
//       params: [inputAddress, 'latest'],
//     });

//     // Convert the hex balance to decimal
//     const balanceInWei = parseInt(balanceHex, 16);

//     // Convert to Ether units (1 Ether = 10^18 Wei) and format
//     const formattedBalance = ethers.utils.formatUnits(balanceInWei, 18); // 18 decimals for ETH

//     // Format the balance to 4 decimal places and append "SepoliaETH"
//     const balanceWithUnit = `${parseFloat(formattedBalance).toFixed(4)} SepoliaETH`;

//     // Set the formatted balance in the component state
//     setBalance(balanceWithUnit);
//   } catch (err) {
//     setErrorMessage(`Error fetching balance: ${err.message}`);
//   }
// };
