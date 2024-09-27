import React, { useState, useEffect } from "react";
import { useSyncProviders } from "../hooks/useSyncProviders";
import { formatAddress } from "~/utils";

// Interface definition for EIP1193Provider
interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  request: (request: { method: string; params?: Array<unknown> }) => Promise<unknown>;
}

// Interface for provider details (to be used with useSyncProviders hook)
interface EIP6963ProviderDetail {
  provider: EIP1193Provider;
  info: {
    uuid: string;
    name: string;
    icon: string;
  };
}

// Main component to discover and connect to wallet providers
const DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail | null>(null);
  const [userAccount, setUserAccount] = useState<string>("");
  const [chainId, setChainId] = useState<string | null>(null);
  const [lastBlock, setLastBlock] = useState<object | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const providers = useSyncProviders(); // Custom hook to get available providers

  // Function to connect to the selected provider using eth_requestAccounts.
  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      const accounts = await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      });

      setSelectedWallet(providerWithInfo);
      setUserAccount(accounts?.[0] as string);
      console.log(`Connected to account: ${accounts?.[0]}`);
      fetchBlockchainData(providerWithInfo.provider);
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error connecting to wallet: ", error);
    }
  };

  // Fetch chain ID, latest block, and accounts
  const fetchBlockchainData = async (provider: EIP1193Provider) => {
    try {
      // Log and fetch Chain ID
      const chainId = await provider.request({ method: "eth_chainId" });
      console.log(`hexadecimal string: ${chainId}`);
      console.log(`decimal number: ${parseInt(chainId as string, 16)}`);
      setChainId(chainId as string);

      // Log and fetch latest block
      const latestBlock = await provider.request({
        method: "eth_getBlockByNumber",
        params: ["latest", true],
      });
      console.log(`Latest Block:`, latestBlock);
      setLastBlock(latestBlock);

      // Log and fetch available accounts
      const accounts = await provider.request({ method: "eth_accounts" });
      console.log(`Accounts:\n${(accounts as string[]).join("\n")}`);
    } catch (error) {
      setErrorMessage(`Error fetching blockchain data: ${error.message}`);
      console.error(`Error: ${error.message}. Code: ${error.code}. Data: ${error.data}`);
    }
  };

  // Function to display the list of available wallet providers as connect buttons
  return (
    <>
      <h2>Wallets Detected:</h2>
      <div>
        {providers.length > 0 ? (
          providers?.map((provider: EIP6963ProviderDetail) => (
            <button key={provider.info.uuid} onClick={() => handleConnect(provider)}>
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
          ))
        ) : (
          <div>No Announced Wallet Providers</div>
        )}
      </div>
      <hr />
      <h2>{userAccount ? "" : "No "}Wallet Selected</h2>
      {userAccount && (
        <div>
          <div>
            <img src={selectedWallet?.info.icon} alt={selectedWallet?.info.name} />
            <div>{selectedWallet?.info.name}</div>
            <div>Account: ({formatAddress(userAccount)})</div>
            <div>Chain ID: {chainId ? chainId : "N/A"}</div>
            {lastBlock && (
              <div>
                <h3>Last Block Details:</h3>
                <p>Block Number: {lastBlock.number}</p>
                <p>Timestamp: {new Date(lastBlock.timestamp * 1000).toLocaleString()}</p>
                <p>Number of Transactions: {lastBlock.transactions.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
    </>
  );
};

export default DiscoverWalletProviders;
