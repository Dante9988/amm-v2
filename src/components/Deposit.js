import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Alert from './Alert';

import '../css/Deposit.css';

import { addLiquidity, loadBalances } from '../store/interactions/interactions';
import { depositRequest, depositSuccess, depositFail } from '../store/reducers/amm';

const Deposit = () => {

    const dispatch = useDispatch();
    const account = useSelector(state => state.provider.account);
    const amm = useSelector(state => state.amm.contract);
    const symbols = useSelector(state => state.tokens.symbols);
    const balances = useSelector(state => state.tokens.balances);
    const tokens = useSelector(state => state.tokens.contracts);
    const provider = useSelector(state => state.provider.connection);
    const isDepositing = useSelector(state => state.amm.depositing.isDepositing);
    const isSuccess = useSelector(state => state.amm.depositing.isSuccess);
    const transactionHash = useSelector(state => state.amm.depositing.transactionHash);

    const [token1Amount, setToken1Amount] = useState(0);
    const [token2Amount, setToken2Amount] = useState(0);
    const [showAlert, setShowAlert] = useState(false);

    const amountHandler = async (e) => {
        if(e.target.id === 'token1') {
            setToken1Amount(e.target.value);
            
            // fetch value on chain
            const result = await amm.calculateToken2Deposit(ethers.utils.parseUnits(e.target.value, 'ether'));
            const _token2Amount = ethers.utils.formatUnits(result.toString(), 'ether');

            // set token2 amount
            setToken2Amount(_token2Amount);
        } else {
            setToken2Amount(e.target.value);

            // fetch value on chain
            const result = await amm.calculateToken1Deposit(ethers.utils.parseUnits(e.target.value, 'ether'));
            const _token1Amount = ethers.utils.formatUnits(result.toString(), 'ether');

            // set token1 amount
            setToken1Amount(_token1Amount);
        }
    }

    const depositHandler = async (e) => {
        e.preventDefault();

        setShowAlert(false);

        const _token1Amount = ethers.utils.parseUnits(token1Amount, 'ether');
        const _token2Amount = ethers.utils.parseUnits(token2Amount, 'ether');
        
        // deposit
        await addLiquidity(provider, amm, tokens, symbols, [_token1Amount, _token2Amount], dispatch);

        // load balances
        await loadBalances(amm, tokens, account, dispatch);

        setShowAlert(true);
    }

    return (
        <div className="swap-container">
          <Card className="swap-card">
            {account ? (
              <Form className="swap-form" onSubmit={depositHandler}>
                <Row className="my-3">
                  <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>Add Liquidity</Form.Label>
                  <Form.Text className="text-end my-2" muted>
                    Balance: {Number(balances[0]).toFixed(2)}
                  </Form.Text>
                  <InputGroup>
                    <Form.Control 
                      type="number" 
                      placeholder="0.0" 
                      min="0.0"
                      step="any"
                      className="input-field"
                      id="token1"
                      onChange={(e) => amountHandler(e)}
                      value={token1Amount === 0 ? '' : token1Amount}
                    />  
                    <InputGroup.Text style={{ width: '100px' }} className="justify-content-center">{ symbols && symbols[0] }</InputGroup.Text>
                  </InputGroup>
                </Row>
    
                <Row className="my-3">
                  <Form.Text className="text-end my-2" muted>
                    Balance: {Number(balances[1]).toFixed(2)}
                  </Form.Text>
                  <InputGroup>
                    <Form.Control 
                      type="number" 
                      placeholder="0.0" 
                      className="input-field"
                      id="token2"
                      onChange={(e) => amountHandler(e)}
                      value={token2Amount === 0 ? '' : token2Amount}
                    />
                    <InputGroup.Text style={{ width: '100px' }} className="justify-content-center">{ symbols && symbols[1] }</InputGroup.Text>
                  </InputGroup>
                </Row>
    
                <Row className="form-row">
                {isDepositing ? (
                    <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} variant="secondary" />
                  ) : (
                    <Button type="submit" className="swap-button">Approve & Deposit</Button>
                  )}
                </Row>
              </Form>
              
            ) : (
              <p className="connect-wallet-message">
                Please connect your wallet.
              </p>
            )}
          </Card>

          {isDepositing ? (
            <Alert message="Deposit Pending..." transactionHash={null} variant="info" setShowAlert={setShowAlert} />
          ) : isSuccess && showAlert ? (
            <Alert message="Deposit Successful" transactionHash={transactionHash} variant="success" setShowAlert={setShowAlert} />
          ) : !isSuccess && showAlert ? (
            <Alert message="Deposit Failed" transactionHash={transactionHash} variant="danger" setShowAlert={setShowAlert} />
          ) : null}

        </div>
    )
}  

export default Deposit;