import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux';

// Components
import Navigation from './Navigation';
import Loading from './Loading';

import { loadAccount, loadProvider, loadNetwork, loadTokens, loadBalances, loadAMM } from '../store/interactions/interactions.js';
// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
// import config from '../config.json';

function App() {
  // let account = '';

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    try {
      // First initialize provider
      const provider = loadProvider(dispatch)
      
      // Then load account directly
      //const account = await loadAccount(dispatch)
      
      
      // Then load network
      const chainId = await loadNetwork(provider, dispatch)
      // Then load tokens
      const tokens = await loadTokens(provider, chainId, dispatch)

      // Then load balances
      //const balances = await loadBalances(provider, chainId, dispatch, account)

      window.ethereum.on('accountsChanged', async () => {
        console.log('accountsChanged')
        await loadAccount(dispatch);
      })

      // Then load AMM
      const amm = await loadAMM(provider, chainId, dispatch)

    } catch (error) {
      console.error("Error:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await loadBlockchainData(); // Await the loading of blockchain data
    };
    fetchData();
  }, []);

  return(
    <Container>
      <Navigation />

      <h1 className='my-4 text-center'>React Hardhat Template</h1>

      <>
        <p className='text-center'><strong>Your ETH Balance:</strong> 1001 ETH</p>
        <p className='text-center'>Edit App.js to add your code here.</p>
      </>
    </Container>
  )
}

export default App;
