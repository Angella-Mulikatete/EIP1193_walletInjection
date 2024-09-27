import { useState, useEffect } from 'react';

const ConnectWallet = () => {
  const [account, setAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [chainId, setChainId] = useState('');
  const [networkName, setNetworkName] = useState('');

  const provider = window.ethereum;

  // Check if the wallet is connected
  const checkProvider = () => {
    if (provider) {
      console.log('provider detected!');
    } else {
      setErrorMessage('No wallet detected! Install MetaMask.');
    }
  };

  // Connect to the wallet
  const connectWallet = async () => {
    try {
      const accounts = await provider.request({ method: 'eth_accounts' });
      setAccount(accounts[0]);
      await checkChainId();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };


  const disconnectWallet = () => {
    setAccount(null);
    setChainId('');
    setNetworkName('');
    setErrorMessage('Disconnected from MetaMask.');
    console.log('Wallet disconnected.');
  };

  // Check the network chain ID
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
  };

  const handleChainChanged = async (chainIdHex) => {
    console.log(`Chain changed to: ${chainIdHex}`);
    await checkChainId();
  };

  const handleConnect = (connectInfo) => {
    console.log('Connected to chain:', connectInfo.chainId);
    checkChainId(); 
  };

  const handleDisconnect = (error) => {
    console.error('Disconnected:', error);
    disconnectWallet(); 
  };

  useEffect(() => {
    checkProvider();

    if (provider) {
      
      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);
      provider.on('chainChanged', handleChainChanged);

      checkChainId();
      
      return () => {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
        provider.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <div>
      <h2>Wallet Connection</h2>
      {account ? (
        <>
          <p>Connected Account: {account}</p>
          <p>Network: {networkName} (Chain ID: {chainId})</p>
          {networkName === 'Unsupported Network' && (
            <p style={{ color: 'red' }}>Please switch to Sepolia or Ethereum Mainnet.</p>
          )}
          <button onClick={disconnectWallet} style={{ marginTop: '10px', backgroundColor: 'red', color: 'white' }}>
            Disconnect Wallet
          </button>
        </>
      ) : (
        <>
          <p>{errorMessage}</p>
          <button onClick={connectWallet} style={{ marginTop: '10px' }}>
            Connect Wallet
          </button>
        </>
      )}
    </div>
  );
};

export default ConnectWallet;


// Fetch available accounts
  // const fetchAccounts = async () => {
  //   try {
  //     const accounts = await provider.request({ method: 'eth_accounts' });
  //     if (accounts.length > 0) {
  //       setAccount(accounts[0]);
  //     } else {
  //       setErrorMessage('Please connect to MetaMask.');
  //     }
  //   } catch (error) {
  //     setErrorMessage(`Error fetching accounts: ${error.message}`);
  //   }
  // };

  // const handleAccountsChanged = (accounts) => {
  //   if (accounts.length > 0) {
  //     setAccount(accounts[0]);
  //   } else {
  //     setErrorMessage('Please connect to MetaMask.');
  //     disconnectWallet(); 
  //   }
  // };
