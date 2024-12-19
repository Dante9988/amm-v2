import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Alert from './Alert';
import '../css/Swap.css';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import { swap, loadBalances } from '../store/interactions/interactions';

const Swap = () => {
    const [price, setPrice] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [inputToken, setInputToken] = useState(null);
    const [outputToken, setOutputToken] = useState(null);
    const [inputAmount, setInputAmount] = useState(0);
    const [outputAmount, setOutputAmount] = useState(0);
    const [balance, setBalance] = useState(0);

    const dispatch = useDispatch();
    const account = useSelector(state => state.provider.account);
    const amm = useSelector(state => state.amm.contract);
    const symbols = useSelector(state => state.tokens.symbols);
    const balances = useSelector(state => state.tokens.balances);
    const tokens = useSelector(state => state.tokens.contracts);
    const provider = useSelector(state => state.provider.connection);
    const isSwapping = useSelector(state => state.amm.swapping.isSwapping);
    const isSuccess = useSelector(state => state.amm.swapping.isSuccess);
    const transactionHash = useSelector(state => state.amm.swapping.transactionHash);



    const inputHandler = async (e) => {
      if(!inputToken || !outputToken) {
          window.alert('Please select token')
          return;
      }
  
      if(inputToken === outputToken) {
          window.alert('Invalid token pairs')
          return;
      }
  
      // Get the input value
      const value = e.target.value;
  
      // Check if value is empty or invalid
      if (!value || value === '') {
          setInputAmount(0);
          setOutputAmount(0);
          return;
      }
  
      try {
          if(inputToken === 'DRGN') {
              setInputAmount(value);
  
              const _token1Amount = ethers.utils.parseUnits(value, 'ether');
              const result = await amm.calculateToken1Swap(_token1Amount)
              const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether');
  
              setOutputAmount(_token2Amount.toString());
          } else {
              setInputAmount(value);
  
              const _token2Amount = ethers.utils.parseUnits(value, 'ether');
              const result = await amm.calculateToken2Swap(_token2Amount)
              const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether');
              setOutputAmount(_token1Amount.toString());
          }
      } catch (error) {
          console.log("Error in input handling:", error);
          setInputAmount(0);
          setOutputAmount(0);
      }
  };

    const swapHandler = async (e) => {
        e.preventDefault();

        setShowAlert(false);

        if (inputToken === outputToken) {
            window.alert('Invalid token pairs')
            return;
        }

        const _inputAmount = ethers.utils.parseUnits(inputAmount, 'ether');
        
        if(inputToken === 'DRGN') {
            const result = await swap(provider, amm, tokens[0], inputToken, _inputAmount, dispatch)
        } else {
            const result = await swap(provider, amm, tokens[1], inputToken, _inputAmount, dispatch)
        }

        await loadBalances(amm, tokens, account, dispatch)
        await getPrice()

        setShowAlert(true);
    }

    const getPrice = async () => {
        if(inputToken === outputToken) {
            setPrice(0);
            return;
        }

        if(inputToken === 'DRGN') {
            setPrice(await amm.token2Balance() / await amm.token1Balance());
        } else {
            setPrice(await amm.token1Balance() / await amm.token2Balance());
        }
    

    }

    useEffect(() => {
        console.log(amm);
        if (inputToken && outputToken) {
            getPrice();
        }
    }, [inputToken, outputToken]);

    const switchTokens = () => {
        setInputToken(outputToken);
        setOutputToken(inputToken);
    };

    // return (
    //     <div>
    //         <Card style={{ width: '450px' }} className="mx-auto px-4">
    //             {account ? (
    //                 <Form onSubmit={swapHandler} style={{ maxWidth: '450px' }} className='mx-auto px-4'>
    //                     <Row className='my-3'>
    //                         <div className='d-flex justify-content-between'>
    //                             <Form.Label><strong>Input:</strong></Form.Label>
    //                             <Form.Text muted>
    //                                 Balance: {
    //                                     inputToken === symbols[0] ? (
    //                                         balances[0]
    //                                     ) : inputToken === symbols[1] ? (
    //                                         balances[1]
    //                                     ) : (
    //                                         '0'
    //                                     )
    //                                 }
    //                             </Form.Text>
    //                         </div>
    //                         <InputGroup>
    //                             <Form.Control 
    //                             type='number' 
    //                             placeholder='0.0' 
    //                             min='0.0'
    //                             step="any"
    //                             onChange={(e) => inputHandler(e)}
    //                             disabled={!inputToken}
    //                             />

    //                             <DropdownButton
    //                             variant='outline-secondary'
    //                             title={inputToken ? inputToken : 'Select Token'}
    //                             >
    //                                 <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)}>DRGN</Dropdown.Item>
    //                                 <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)}>USD</Dropdown.Item>
    //                             </DropdownButton>
    //                         </InputGroup>
                            
    //                     </Row>

    //                     <Row className='my-2 justify-content-center'>
    //                         <Button 
    //                             variant="secondary" 
    //                             onClick={switchTokens} 
    //                             style={{ borderRadius: '50%', width: '40px', height: '40px' }}
    //                         >
    //                             ⇅
    //                         </Button>
    //                     </Row>

    //                     <Row className='my-4'>

    //                         <div className='d-flex justify-content-between'>
    //                             <Form.Label><strong>Output:</strong></Form.Label>
    //                             <Form.Text muted>
    //                                 Balance: {
    //                                     outputToken === symbols[0] ? (
    //                                         balances[0]
    //                                     ) : outputToken === symbols[1] ? (
    //                                         balances[1]
    //                                     ) : (
    //                                         '0'
    //                                     )
    //                                 }
    //                             </Form.Text>
    //                         </div>
    //                         <InputGroup>
    //                             <Form.Control 
    //                             type='number' 
    //                             placeholder='0.0' 
    //                             value={outputAmount === 0 ? "" : outputAmount}
    //                             disabled
    //                             />

    //                             <DropdownButton
    //                             variant='outline-secondary'
    //                             title={outputToken ? outputToken : 'Select Token'}
    //                             >
    //                                 <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>DRGN</Dropdown.Item>
    //                                 <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>USD</Dropdown.Item>
    //                             </DropdownButton>
    //                         </InputGroup>
    //                     </Row>

    //                     <Row className='my-3'>
    //                         {isSwapping ? (
    //                             <>
    //                                 <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} variant="secondary" />
    //                             </>
    //                         ) : (
    //                             <Button type='submit'>Swap</Button>
    //                         )}
    //                         <Form.Text muted>
    //                             Exchange Rate: {price}
    //                         </Form.Text>
    //                     </Row>

    //                 </Form>
    //             ) : (
    //                 <p
    //                 className='d-flex justify-content-center align-items-center'
    //                 style={{ height: '300px' }}
    //                 >
    //                     Please connect your wallet.
    //                 </p>
    //             )}
    //         </Card>

    //         {isSwapping ? (
    //             <Alert 
    //                 message={'Swap Pending...'}
    //                 transactionHash={null}
    //                 variant={'info'}
    //                 setShowAlert={setShowAlert}
    //             />
    //         ) : isSuccess && showAlert ? (
    //             <Alert 
    //                 message={'Swap Successful'}
    //                 transactionHash={transactionHash}
    //                 variant={'success'}
    //                 setShowAlert={setShowAlert}
    //             />
    //         ) : !isSuccess && showAlert ? (
    //             <Alert 
    //                 message={'Swap Failed'}
    //                 transactionHash={transactionHash}
    //                 variant={'danger'}
    //                 setShowAlert={setShowAlert}
    //             />
    //         ) : (
    //             <></>
    //         )}

            
    //     </div>
    // )

    return (
        <div className="swap-container">
          <Card className="swap-card">
            {account ? (
              <Form onSubmit={swapHandler} className="swap-form">
                <Row className="form-row">
                  <div className="form-header">
                    <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>Pay:</Form.Label>
                    <Form.Text muted>
                      Balance: {inputToken === symbols[0] ? Number(balances[0]).toFixed(2) : inputToken === symbols[1] ? Number(balances[1]).toFixed(2) : '0'}
                    </Form.Text>
                  </div>
                  <InputGroup>
                    <Form.Control 
                      type="number" 
                      placeholder="0.0" 
                      min="0.0"
                      step="any"
                      onChange={(e) => inputHandler(e)}
                      disabled={!inputToken}
                      className="input-field"
                    />
                    <DropdownButton
                      variant="outline-secondary"
                      title={inputToken ? inputToken : 'Select Token'}
                      className="dropdown-button"
                    >
                      <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)}>DRGN</Dropdown.Item>
                      <Dropdown.Item onClick={(e) => setInputToken(e.target.innerHTML)}>USD</Dropdown.Item>
                    </DropdownButton>   
                  </InputGroup>
                </Row>
    
                <Row className="switch-row">
                  <Button 
                    variant="secondary" 
                    onClick={switchTokens} 
                    className="switch-button"
                  >
                    ⇅
                  </Button>
                </Row>
    
                <Row className="form-row">
                  <div className="form-header">
                    <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>Receive:</Form.Label>
                    <Form.Text muted>
                      Balance: {outputToken === symbols[0] ? Number(balances[0]).toFixed(2) : outputToken === symbols[1] ? Number(balances[1]).toFixed(2) : '0'}
                    </Form.Text>
                  </div>
                  <InputGroup>
                    <Form.Control 
                      type="number" 
                      placeholder="0.0" 
                      value={outputAmount === 0 ? "" : outputAmount}
                      disabled
                      className="input-field"
                    />
                    <DropdownButton
                      variant="outline-secondary"
                      title={outputToken ? outputToken : 'Select Token'}
                      className="dropdown-button"
                    >
                      <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>DRGN</Dropdown.Item>
                      <Dropdown.Item onClick={(e) => setOutputToken(e.target.innerHTML)}>USD</Dropdown.Item>
                    </DropdownButton>
                  </InputGroup>
                </Row>
    
                <Row className="form-row">
                  {isSwapping ? (
                    <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} variant="secondary" />
                  ) : (
                    <Button type="submit" className="swap-button">Swap</Button>
                  )}
                  <Form.Text muted className="exchange-rate">
                    Exchange Rate: {Number(price).toFixed(6)} {inputToken === 'DRGN' ? 'USD per 1 DRGN' : 'DRGN per 1 USD'}
                  </Form.Text>
                </Row>
              </Form>
              
            ) : (
              <p className="connect-wallet-message">
                Please connect your wallet.
              </p>
            )}
          </Card>
    
          {isSwapping ? (
            <Alert message="Swap Pending..." transactionHash={null} variant="info" setShowAlert={setShowAlert} />
          ) : isSuccess && showAlert ? (
            <Alert message="Swap Successful" transactionHash={transactionHash} variant="success" setShowAlert={setShowAlert} />
          ) : !isSuccess && showAlert ? (
            <Alert message="Swap Failed" transactionHash={transactionHash} variant="danger" setShowAlert={setShowAlert} />
          ) : null}
        </div>
      );

}

export default Swap;