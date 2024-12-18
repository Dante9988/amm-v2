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
    if (chainId === '0x18e8f') {
      try {
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
      } catch (error) {
        console.error("Failed to switch to Creditcoin Testnet:", error);
      }
    } else {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        });
      } catch (error) {
        console.error("Failed to switch network:", error);
      }
    }
  }

//   return (
//     <Navbar className='my-3' expand="lg">
//       <img
//         alt="logo"
//         src={logo}
//         width="40"
//         height="40"
//         className="d-inline-block align-top mx-3"
//       />
//       <Navbar.Brand href="#">DragonAI Swap</Navbar.Brand>
//       <Navbar.Toggle aria-controls="nav" />
//       <Navbar.Collapse className="justify-content-end">

//         <div className='d-flex justify-content-end mt-3'>
//           <Form.Select
//             aria-label="Select Network"
//             value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
//             onChange={networkHandler}
//             style={{ maxWidth: '200px', marginRight: '20px' }}
//           >
//             <option value="0" disabled>Select Network</option>
//             <option value="0x7A69">Hardhat</option>
//             <option value="0x18e8f">Creditcoin Testnet</option>

//           </Form.Select>


//         {account ? (
//             <Navbar.Text className='d-flex align-items-center'>
//               {account.slice(0, 5) + '...' + account.slice(38, 42)}
//               <Blockies 
//                 seed={account}
//                 size={10}
//                 scale={3}
//                 color='#2187D0'
//                 bgColor='#F1F2F9'
//                 spotColor='#767F92'
//                 className='identicon mx-2'
//               />
//             </Navbar.Text>
//           ) : (
//             <Button onClick={connectHandler}>Connect</Button>
//           )}
//         </div>
//       </Navbar.Collapse>
//     </Navbar>
//   );
// }

// export default Navigation;
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
