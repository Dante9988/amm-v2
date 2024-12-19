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

import '../css/Withdraw.css';

import { removeLiquidity, loadBalances } from '../store/interactions/interactions';
import { withdrawRequest, withdrawSuccess, withdrawFail } from '../store/reducers/amm';

const Withdraw = () => {

    const dispatch = useDispatch();
    const account = useSelector(state => state.provider.account);
    const amm = useSelector(state => state.amm.contract);
    const symbols = useSelector(state => state.tokens.symbols);
    const balances = useSelector(state => state.tokens.balances);
    const tokens = useSelector(state => state.tokens.contracts);
    const provider = useSelector(state => state.provider.connection);
    const isWithdrawing = useSelector(state => state.amm.withdrawing.isWithdrawing);
    const isSuccess = useSelector(state => state.amm.withdrawing.isSuccess);
    const transactionHash = useSelector(state => state.amm.withdrawing.transactionHash);
    const sharesBalance = useSelector(state => state.amm.shares);

    const [shares, setShares] = useState(0);
    const [sharePercentage, setSharePercentage] = useState(0);
    const [showAlert, setShowAlert] = useState(false);

    const handleSliderChange = (e) => {
        const percentage = parseInt(e.target.value);
        setSharePercentage(percentage);
        
        // Calculate shares based on percentage
        const shareAmount = (percentage / 100) * sharesBalance;
        setShares(shareAmount);
    };

    // Handle direct share input
    const handleShareInput = (e) => {
        const shareAmount = e.target.value;
        setShares(shareAmount);
        
        // Calculate percentage based on shares
        const percentage = (shareAmount / sharesBalance) * 100;
        setSharePercentage(Math.min(100, Math.max(0, percentage))); // Clamp between 0-100
    };

    const withdrawHandler = async (e) => {
        e.preventDefault();

        setShowAlert(false);

        const _shares = await amm.shares(account);

        
        // deposit
        await removeLiquidity(provider, amm, shares, dispatch);

        // load balances
        await loadBalances(amm, tokens, account, dispatch);

        setShowAlert(true);
    }


    return (
        <div className="swap-container">
          <Card className="swap-card">
            {account ? (
              <Form className="swap-form" onSubmit={withdrawHandler}>
                <Row className="my-3">
                  <Form.Label style={{ fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>
                    Withdraw Liquidity
                  </Form.Label>
                  <Form.Text className="text-end my-2" muted>
                    Shares: {Number(sharesBalance).toFixed(2)}
                  </Form.Text>
                  <div className="share-percentage">
                    {sharePercentage.toFixed(2)}% of shares
                  </div>
            
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharePercentage}
                    onChange={handleSliderChange}
                    className="share-slider"
                  />
                  <InputGroup>
                    <Form.Control 
                      type="number" 
                      placeholder="0.0" 
                      min="0.0"
                      step="any"
                      className="input-field"
                      id="shares"
                      onChange={handleShareInput}
                      value={shares === 0 ? '' : shares}
                    />  
                    <InputGroup.Text style={{ width: '100px' }} className="justify-content-center">
                      Shares
                    </InputGroup.Text>
                  </InputGroup>
                </Row>

                <Row className="balance-row">
                    <Form.Text className="balance-text">
                        DRGN Balance: <span className="token-amount">{Number(balances[0]).toFixed(18)}</span>
                    </Form.Text>
                </Row>

                <Row className="balance-row">
                    <Form.Text className="balance-text">
                        USD Balance: <span className="token-amount">{Number(balances[1]).toFixed(18)}</span>
                    </Form.Text>
                </Row>

                <Row className="form-row">
                {isWithdrawing ? (
                    <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} variant="secondary" />
                  ) : (
                    <Button type="submit" className="swap-button">Withdraw</Button>
                  )}
                </Row>
              </Form>
              
            ) : (
              <p className="connect-wallet-message">
                Please connect your wallet.
              </p>
            )}
          </Card>

          {isWithdrawing ? (
            <Alert message="Withdrawal Pending..." transactionHash={null} variant="info" setShowAlert={setShowAlert} />
          ) : isSuccess && showAlert ? (
            <Alert message="Withdrawal Successful" transactionHash={transactionHash} variant="success" setShowAlert={setShowAlert} />
          ) : !isSuccess && showAlert ? (
            <Alert message="Withdrawal Failed" transactionHash={transactionHash} variant="danger" setShowAlert={setShowAlert} />
          ) : null}
        </div>
    )
}

export default Withdraw;