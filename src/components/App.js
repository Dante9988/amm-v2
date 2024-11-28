import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux';

// Components
import Navigation from './Navigation';
import Loading from './Loading';

import { loadAccount, loadProvider, loadNetwork } from '../store/interactions/interactions';
// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
// import config from '../config.json';

import { setAccount, setChainId } from '../store/reducers/provider';

function App() {
  // let account = '';

  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    try {
      // First initialize provider
      const provider = loadProvider(dispatch)
      
      // Then load account directly
      const account = await loadAccount(dispatch)
      
      // Then load network
      const chainId = await loadNetwork(provider, dispatch)

    } catch (error) {
      console.error("Error:", error)
    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, []);

  return(
    <Container>
      <Navigation account={"0x0"} />

      <h1 className='my-4 text-center'>React Hardhat Template</h1>

      <>
        <p className='text-center'><strong>Your ETH Balance:</strong> 1001 ETH</p>
        <p className='text-center'>Edit App.js to add your code here.</p>
      </>
    </Container>
  )
}

export default App;
