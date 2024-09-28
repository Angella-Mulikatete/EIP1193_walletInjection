import  {useEffect, useState} from 'react'
import { ethers } from 'ethers';

const UseWallet = () => {
  const [accounts, setAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [chainIdDec, setChainId] = useState('');
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
        setChainId(chainIdDec);
        setNetworkName('Ethereum Mainnet');
      } else if (chainIdHex === '0xaa36a7') {
        setChainId(chainIdDec);
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
     const balance = await provider.request({ method: "eth_getBalance", params:[inputAddress,"latest"] });
     const balInDec = ethers.formatEther(balance);
    setBalance(balInDec);
    } catch(err){
        setErrorMessage(`Error fetching balance: ${err.message}`)
    }
  }

  const handleChainChanged = async (chainIdDec) => {
    setChainId(chainIdDec);
    setNetworkName(getNetworkName(chainIdDec));
    setErrorMessage(`Network changed to ${getNetworkName(chainIdDec)}`);
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
    chainIdDec,
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


