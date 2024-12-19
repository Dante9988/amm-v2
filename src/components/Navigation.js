import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../logo.png';
import Blockies from 'react-blockies';
import Button from 'react-bootstrap/Button';
import { loadAccount, loadBalances } from '../store/interactions/interactions';
import config from '../config.json';
import '../css/Navigation.css';
const Navigation = () => {  
  const dispatch = useDispatch();
  const account = useSelector(state => state.provider.account)
  const tokens = useSelector(state => state.tokens.contracts)
  const chainId = useSelector(state => state.provider.chainId)
  const amm = useSelector(state => state.amm.contract)
  
  const connectHandler = async () => {
    const account =await loadAccount(dispatch);
    await loadBalances(amm, tokens, account, dispatch);
  }

  const networkHandler = async (e) => {  
    const chainId = e.target.value;
    
    try {
      if (chainId === '0x18e8f') {
        try {
          // First try to switch to Creditcoin network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x18e8f' }],
            name: 'Creditcoin Testnet',
            rpcUrls: ['https://rpc.cc3-testnet.creditcoin.network'],
            nativeCurrency: {
              name: 'Creditcoin',
              symbol: 'tCTC',
              decimals: 18
            },
            blockExplorerUrls: ['https://creditcoin-testnet.blockscout.com/']
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x18e8f',
                rpcUrls: ['https://rpc.cc3-testnet.creditcoin.network'],
                chainName: 'Creditcoin Testnet',
                nativeCurrency: {
                  name: 'Creditcoin',
                  symbol: 'tCTC',
                  decimals: 18
                },
                blockExplorerUrls: ['https://creditcoin-testnet.blockscout.com/']
              }]
            });
          } else {
            throw switchError;
          }
        }
      } else {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        });
      }

      try {
        // Reload wallet state
        const account = await loadAccount(dispatch);
        if (account && amm) {
          window.location.reload();
          await loadBalances(amm, tokens, account, dispatch);
        }
      } catch (error) {
        console.error("Error loading account or balances:", error);
      }
      
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  }

return (
  <Navbar className='nav-wrapper' expand="lg">
    <div className='nav-content'>
      <img
        alt="logo"
        src={logo}
        className="nav-logo"
      />
      <Navbar.Brand href="#" className='brand-text'>DragonAI Swap</Navbar.Brand>

      <Navbar.Toggle aria-controls="nav" />
      <Navbar.Collapse className="justify-content-end">
        <div className='d-flex justify-content-end mt-3'>
          <Form.Select
            aria-label="Select Network"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
            className='network-select'
          >
            <option value="0" disabled>Select Network</option>
            <option value="0x7A69">Hardhat</option>
            <option value="0x18e8f">Creditcoin Testnet</option>
          </Form.Select>

          {account ? (
            <div className='account-info'>
              <span className='account-address'>
                {account.slice(0, 5) + '...' + account.slice(38, 42)}
              </span>
              <Blockies 
                seed={account}
                size={10}
                scale={3}
                color='#2187D0'
                bgColor='#F1F2F9'
                spotColor='#767F92'
                className='identicon'
              />
            </div>
          ) : (
            <Button onClick={connectHandler} className='connect-button'>
              Connect
            </Button>
          )}
        </div>
      </Navbar.Collapse>
    </div>
  </Navbar>
);
}

export default Navigation;
