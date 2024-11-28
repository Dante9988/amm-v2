import { ethers } from 'ethers';
import { setAccount, setProvider, setNetwork } from '../reducers/provider';

export const loadProvider = (dispatch) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Completely disable ENS resolution
    provider.resolveName = async () => null;
    provider._resolveNames = async (...args) => args;
    
    dispatch(setProvider(provider));
    return provider;
}
  
  export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch(setNetwork(chainId))
  
    return chainId
  }
  
  export const loadAccount = async (dispatch) => {
    try {
        // Direct MetaMask request without going through provider
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        const account = ethers.utils.getAddress(accounts[0]);
        dispatch(setAccount(account));
        return account;
    } catch (error) {
        console.error('Error loading account:', error);
        return null;
    }
  }

  