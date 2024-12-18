import { Alert as BootstrapAlert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import '../css/Alert.css';

const Alert = ({ message, transactionHash, variant, setShowAlert }) => {
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    
    const explorerUrl = 'https://creditcoin-testnet.blockscout.com/';

    return (
        <div className="alert-container">
            <BootstrapAlert 
                variant={variant}
                onClose={() => setShowAlert(false)}
                dismissible
                className="custom-alert"
            >
                <div className="alert-content">
                    <BootstrapAlert.Heading>{message}</BootstrapAlert.Heading>
                    {transactionHash && (
                        <div className="transaction-details">
                            <span className="hash-label">Transaction Hash:</span>
                            {chainId === 102031 ? (
                                <a 
                                    href={`${explorerUrl}tx/${transactionHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hash-link"
                                >
                                    {transactionHash.slice(0, 6) + '...' + transactionHash.slice(60, 66)}
                                </a>
                            ) : (
                                <span className="hash-value">
                                    {transactionHash.slice(0, 6) + '...' + transactionHash.slice(60, 66)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </BootstrapAlert>
        </div>
    );
};

export default Alert;