import { ethers } from 'ethers';
import { setAccount, setProvider, setNetwork } from '../reducers/provider';
import config from '../../config.json';
import TOKEN_ABI from '../../abis/Token.json';
import AMM_ABI from '../../abis/AMM.json';
import { setContracts, setSymbols, setBalances } from '../reducers/tokens';
import { setContract, sharesLoaded } from '../reducers/amm';

export const loadProvider = (dispatch) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Completely disable ENS resolution
    // provider.resolveName = async () => null;
    // provider._resolveNames = async (...args) => args;
    
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

export const loadTokens = async (provider, chainId, dispatch) => {
  console.log(`Chain ID: ${chainId}`);
  const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI.abi, provider);
  const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI.abi, provider);

  dispatch(setContracts([ token, usd ]));

  dispatch(setSymbols([ await token.symbol(), await usd.symbol() ]));
}

export const loadAMM = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(config[chainId].amm.address, AMM_ABI, provider);
  dispatch(setContract(amm));
  return amm;
}

export const loadBalances = async (amm, tokens, account, dispatch) => {
  try {
    const tokenBalance = await tokens[0].balanceOf(account);
    const usdBalance = await tokens[1].balanceOf(account);
    dispatch(setBalances([ethers.utils.formatUnits(tokenBalance, await tokens[0].decimals()), ethers.utils.formatUnits(usdBalance, await tokens[1].decimals())]));

    const shares = await amm.shares(account);
    dispatch(sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether')));

  } catch (error) {
    console.error(`Error loading balances: ${error.message}`);
  }
};

  