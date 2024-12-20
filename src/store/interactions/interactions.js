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
  withdrawFail,
  swapsLoaded,
  swapsLoading,
  loadingOlderSwaps,
  olderSwapsLoaded,
  swapsError,
  loadingComplete
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


export const loadAllSwaps = async (provider, amm, account, dispatch) => {

  console.log(`account: ${account}`);

  try {
    // fetch swaps from blockchain
    const swapStream = await amm.queryFilter(
      amm.filters.Swap(account, null, null, null, null, null, null, null),
      0,
      await provider.getBlockNumber()
    );

    const swaps = swapStream.map(event => {
      return {
        hash: event.transactionHash,
        user: event.args.user,
        tokenGive: event.args.tokenGive,
        tokenGiveAmount: event.args.tokenGiveAmount.toString(),
        tokenGet: event.args.tokenGet,
        tokenGetAmount: event.args.tokenGetAmount.toString(),
        timestamp: new Date(event.args.timestamp.toNumber() * 1000).toLocaleString()
      };
    });

    dispatch(swapsLoaded(swaps));

  } catch (error) {
    console.error("Error loading all swaps:", error);
  }
}

export const loadRecentSwaps = async (provider, amm, account, dispatch) => {
  try {
      dispatch(swapsLoading());

      const INITIAL_LOAD_BLOCKS = 10000;
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - INITIAL_LOAD_BLOCKS);

      const swapStream = await amm.queryFilter(
          amm.filters.Swap(account, null, null, null, null, null, null, null),
          fromBlock,
          currentBlock
      );

      const swaps = swapStream.map(event => ({
          hash: event.transactionHash,
          user: event.args.user,
          tokenGive: event.args.tokenGive,
          tokenGiveAmount: event.args.tokenGiveAmount.toString(),
          tokenGet: event.args.tokenGet,
          tokenGetAmount: event.args.tokenGetAmount.toString(),
          timestamp: new Date(event.args.timestamp.toNumber() * 1000).toLocaleString(),
          blockNumber: event.blockNumber
      }));

      dispatch(swapsLoaded(swaps));

      // Start loading older swaps
      loadOlderSwaps(provider, amm, account, dispatch, fromBlock);

  } catch (error) {
      console.error("Error loading recent swaps:", error);
      dispatch(swapsError(error.message));
  }
}

export const loadOlderSwaps = async (provider, amm, account, dispatch, fromCurrentBlock) => {
    try {
        // Initial small batch size for quick response
        let BATCH_SIZE = 100;
        const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay
        let emptyBatchesCount = 0;
        const MAX_EMPTY_BATCHES = 10; // Stop after 10 consecutive empty batches

        // Load older swaps in batches
        for (let fromBlock = fromCurrentBlock - BATCH_SIZE; fromBlock >= 0; fromBlock -= BATCH_SIZE) {
            const toBlock = Math.max(0, fromBlock + BATCH_SIZE - 1);
            
            // Update loading progress
            dispatch(loadingOlderSwaps({ 
                fromBlock, 
                toBlock,
                currentProgress: Math.floor(((fromCurrentBlock - fromBlock) / fromCurrentBlock) * 100)
            }));

            try {
                const swapStream = await amm.queryFilter(
                    amm.filters.Swap(account, null, null, null, null, null, null, null),
                    fromBlock,
                    toBlock
                );

                // If no transactions found, increment empty batches counter
                if (swapStream.length === 0) {
                    emptyBatchesCount++;
                    
                    // Increase batch size after each empty batch
                    if (BATCH_SIZE < 10000) {
                        BATCH_SIZE = Math.min(10000, BATCH_SIZE * 10);
                        console.log(`Increasing batch size to ${BATCH_SIZE}`);
                    }

                    // Stop if we've seen too many empty batches
                    if (emptyBatchesCount >= MAX_EMPTY_BATCHES) {
                        console.log('Stopping search: Too many empty batches');
                        break;
                    }
                } else {
                    // Reset empty batches counter if we found transactions
                    emptyBatchesCount = 0;
                    
                    const batchSwaps = swapStream.map(event => ({
                        hash: event.transactionHash,
                        user: event.args.user,
                        tokenGive: event.args.tokenGive,
                        tokenGiveAmount: event.args.tokenGiveAmount.toString(),
                        tokenGet: event.args.tokenGet,
                        tokenGetAmount: event.args.tokenGetAmount.toString(),
                        timestamp: new Date(event.args.timestamp.toNumber() * 1000).toLocaleString(),
                        blockNumber: event.blockNumber
                    }));

                    dispatch(olderSwapsLoaded(batchSwaps));
                }

                // Break if we've reached the beginning
                if (fromBlock <= 0) break;

                // Add delay between batches
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));

            } catch (error) {
                console.error(`Error loading batch ${fromBlock}-${toBlock}:`, error);
                continue;
            }
        }

        dispatch(loadingComplete());

    } catch (error) {
        console.error("Error in loadOlderSwaps:", error);
        dispatch(swapsError(error.message));
    }
}

