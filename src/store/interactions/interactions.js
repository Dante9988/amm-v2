import { ethers } from 'ethers';
import { setAccount, setProvider, setNetwork } from '../reducers/provider';
import config from '../../config.json';
import TOKEN_ABI from '../../abis/Token.json';
import AMM_ABI from '../../abis/AMM.json';
import { setContracts, setSymbols, setBalances } from '../reducers/tokens';
import { 
  setContract, 
  sharesLoaded, 
  swapRequest, 
  swapSuccess, 
  swapComplete, 
  swapFail, 
  depositRequest, 
  depositSuccess, 
  depositFail, 
  withdrawRequest, 
  withdrawSuccess, 
  withdrawFail 
} from '../reducers/amm';

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
  const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI.abi, provider);
  const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI.abi, provider);

  dispatch(setContracts([ token, usd ]));

  dispatch(setSymbols([ await token.symbol(), await usd.symbol() ]));

  return [ token, usd ]
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

export const addLiquidity = async (provider, amm, tokens, symbol, amounts, dispatch) => {

  const signer = await provider.getSigner();

  dispatch(depositRequest())

  let transaction;
  try {

    // Approve the AMM to spend token0
    transaction = await tokens[0].connect(signer).approve(amm.address, amounts[0], { gasLimit: 2000000 });
    await transaction.wait();

    // Approve the AMM to spend token1
    transaction = await tokens[1].connect(signer).approve(amm.address, amounts[1], { gasLimit: 2000000 });
    await transaction.wait();

    // Add liquidity
    transaction = await amm.connect(signer).addLiquidity(amounts[0], amounts[1], { gasLimit: 2000000 });
    await transaction.wait();

    dispatch(depositSuccess(transaction.hash));


  } catch (error) {
    dispatch(depositFail());
    if (error.code === 'ACTION_REJECTED') {
      console.log('Transaction was rejected by the user.');
    } else {
      console.error('Error during add liquidity:', error);
    }
  }


}

export const removeLiquidity = async (provider, amm, shares, dispatch) => {
  const signer = await provider.getSigner();

  dispatch(withdrawRequest())

  let transaction;
  try {
    transaction = await amm.connect(signer).removeLiquidity(ethers.utils.parseUnits(shares.toString(), 'ether'), { gasLimit: 2000000 });
    await transaction.wait();
    dispatch(withdrawSuccess(transaction.hash));
  } catch (error) {
    dispatch(withdrawFail());
    if (error.code === 'ACTION_REJECTED') {
      console.log('Transaction was rejected by the user.');
    } else {
      console.error('Error during remove liquidity:', error);
    }
  }
}

export const swap = async (provider, amm, token, symbol, amount, dispatch) => {

  dispatch(swapRequest())
  let transaction;
  try {

    // Approve the AMM to spend the token
    transaction = await token.connect(await provider.getSigner()).approve(amm.address, amount, { gasLimit: 2000000 });
    await transaction.wait();

    // Swap the token
    if (symbol === 'DRGN') {
      transaction = await amm.connect(await provider.getSigner()).swapExactInput(amount, { gasLimit: 2000000 });
    } else {
      transaction = await amm.connect(await provider.getSigner()).swapExactOutput(amount, { gasLimit: 2000000 });
    }

    await transaction.wait();
    dispatch(swapSuccess(transaction.hash));


  } catch (error) {
    dispatch(swapFail());
    if (error.code === 'ACTION_REJECTED') {
      console.log('Transaction was rejected by the user.');
    } else {
      console.error('Error during swap:', error);
    }
  }


}
