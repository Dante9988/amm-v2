import { useEffect, useState } from 'react'
import { Container, Card } from 'react-bootstrap'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Components
import Navigation from './Navigation';
import Tabs from './Tabs';
import Swap from './Swap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Charts from './Charts';
import '../css/App.css';

import { loadAccount, loadProvider, loadNetwork, loadTokens, loadBalances, loadAMM } from '../store/interactions/interactions.js';
// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
// import config from '../config.json';

function App() {
  // let account = '';

  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const loadBlockchainData = async () => {
    try {
      // First initialize provider
      const provider = loadProvider(dispatch)
      const account = await loadAccount(dispatch);
      // Then load network
      const chainId = await loadNetwork(provider, dispatch)
      // Then load tokens
      const tokens = await loadTokens(provider, chainId, dispatch)

      // Then load AMM
      const amm = await loadAMM(provider, chainId, dispatch)

      window.ethereum.on('accountsChanged', async () => {
        console.log('accountsChanged')
        await loadAccount(dispatch);
      })

      // Then load balances
      const balances = await loadBalances(amm, tokens, account, dispatch)

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
        <HashRouter>
          <Navigation />
          <hr />
          <Tabs />
          <Routes>
            <Route exact path="" element={<Swap />} />
            <Route exact path="/deposit" element={<Deposit />} />
            <Route exact path="/withdraw" element={<Withdraw />} />
            <Route exact path="/charts" element={<Charts />} />
        </Routes>
      </HashRouter>
    </Container>
  )
}

export default App;
