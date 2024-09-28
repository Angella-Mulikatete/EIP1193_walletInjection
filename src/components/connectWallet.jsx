
import useWallet from './useWallet';

  const ConnectWallet = () => {
   const {
    accounts,
    chainIdDec,
    networkName,
    inputAddress,
    balInDec,
    fetchBalance,
    errorMessage,
    setInputAddress,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Wallet Connection</h2>

      {accounts ? (
        <>
          <p>Connected Account: {accounts}</p>
          <p>Network: {networkName} (Chain ID: {chainIdDec})</p>
          {networkName === 'Unsupported Network' && (
            <p style={{ color: 'red' }}>Please switch to Sepolia or Ethereum Mainnet.</p>
          )}

           <div style={{ marginTop: '20px' }}>
            <h3>Check Address Balance</h3>
            <label >Enter Address: </label>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              placeholder="Enter Ethereum address"
              style={{ width: '300px', padding: '8px', margin: '10px 0' }}
            />
            <button onClick={fetchBalance} style={{ padding: '10px 20px' }}>
              Get Balance
            </button>

            {balInDec && (
              <p>
                Balance: {balInDec} ETH
              </p>
            )}
          </div>
          <button
            onClick={disconnectWallet}
            style={{ marginTop: '10px', backgroundColor: 'red', color: 'white' }}
          >
            Disconnect Wallet
          </button>

         
        </>
      ) : (
        <>
          <p style={{ color: 'red' }}>{errorMessage}</p>
          <button onClick={connectWallet} style={{ marginTop: '10px' }}>
            Connect Wallet
          </button>
        </>
      )}
    </div>
  )
}

export default ConnectWallet

