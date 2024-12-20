import Card from 'react-bootstrap/Card';
import { FaExchangeAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { BsWallet2 } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import { ethers } from 'ethers';
import Loading from './Loading';
import { loadAllSwaps, loadOlderSwaps, loadRecentSwaps } from '../store/interactions/interactions';
import '../css/Charts.css';


const Charts = () => {

    const dispatch = useDispatch();
    const amm = useSelector(state => state.amm.contract);
    const symbols = useSelector(state => state.tokens.symbols);
    const tokens = useSelector(state => state.tokens.contracts);
    const provider = useSelector(state => state.provider.connection);
    const account = useSelector(state => state.provider.account);
    const swaps = useSelector(state => state.amm.swaps);
    const chainId = useSelector(state => state.provider.chainId);
    const { isLoading, isLoadingOlder, loadingProgress } = useSelector(state => state.amm.swapLoading);

    const [expandedTx, setExpandedTx] = useState(null);
    const [showAllTxns, setShowAllTxns] = useState(false);
    const [isLoadingOlderTxns, setIsLoadingOlderTxns] = useState(false);

    const INITIAL_DISPLAY_COUNT = 3;

    useEffect(() => {
        if(provider && amm) {
            dispatch({ type: 'CLEAR_SWAPS' });
            loadRecentSwaps(provider, amm, account, dispatch);
        }
    }, [provider, amm, account, dispatch]);

    // Handle loading older swaps separately
    const handleLoadOlderSwaps = useCallback(() => {
        if (!isLoadingOlderTxns && provider && amm && account) {
            setIsLoadingOlderTxns(true);
            const currentBlock = swaps[swaps.length - 1]?.blockNumber;
            if (currentBlock) {
                loadOlderSwaps(provider, amm, account, dispatch, currentBlock)
                    .finally(() => setIsLoadingOlderTxns(false));
            }
        }
    }, [provider, amm, account, dispatch, swaps, isLoadingOlderTxns]);

    // Auto-load older swaps when initial swaps are loaded
    useEffect(() => {
        if (swaps.length > 0 && !isLoadingOlder) {
            handleLoadOlderSwaps();
        }
    }, [swaps.length, handleLoadOlderSwaps]);

    const toggleTx = (hash) => {
        setExpandedTx(expandedTx === hash ? null : hash);
    };

    const displayedSwaps = showAllTxns ? swaps : swaps.slice(0, INITIAL_DISPLAY_COUNT);

    const getExplorerDetails = (chainId, hash) => {
        switch (chainId) {
            case 102031: // Creditcoin testnet
                return {
                    url: `https://creditcoin-testnet.blockscout.com/tx/${hash}`,
                    text: 'View on Blockscout ↗'
                };
            case 1: // Ethereum Mainnet
                return {
                    url: `https://etherscan.io/tx/${hash}`,
                    text: 'View on Etherscan ↗'
                };
            case 5: // Goerli
                return {
                    url: `https://goerli.etherscan.io/tx/${hash}`,
                    text: 'View on Etherscan ↗'
                };
            // Add more networks as needed
            default:
                return {
                    url: null,
                    text: 'Explorer not available'
                };
        }
    };

    // Component rendering functions
    const renderLoadingState = () => (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">
                <span>Loading transactions</span>
                <span className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </span>
            </div>
        </div>
    );

    const renderTransactionRow = (swap) => (
        <div key={swap.hash} className="transaction-row-container">
            <div className="transaction-row" onClick={() => toggleTx(swap.hash)}>
                <div className="cell">
                    <FaExchangeAlt className="swap-icon" />
                    Swap
                </div>
                <div className="cell">{Number(ethers.utils.formatUnits(swap.tokenGiveAmount.toString(), 18)).toFixed(6)}</div>
                <div className="cell">{Number(ethers.utils.formatUnits(swap.tokenGetAmount.toString(), 18)).toFixed(6)}</div>
                <div className="cell">{swap.timestamp}</div>
                <div className="cell">
                    {`${swap.user.slice(0, 6)}...${swap.user.slice(-4)}`}
                </div>
                <div className="expand-icon">
                    {expandedTx === swap.hash ? <FaChevronUp /> : <FaChevronDown />}
                </div>
            </div>

            {expandedTx === swap.hash && (
                <div className="transaction-card">
                    <div className="transaction-details">
                        <div className="amount-container">
                            <span className="amount">{Number(ethers.utils.formatUnits(swap.tokenGiveAmount.toString(), 18)).toFixed(6)}</span>
                            <span className="token-address" title={swap.tokenGive}>
                                {`${swap.tokenGive.slice(0, 6)}...${swap.tokenGive.slice(-4)}`}
                            </span>
                        </div>

                        <div className="arrow">→</div>

                        <div className="amount-container">
                            <span className="amount">{Number(ethers.utils.formatUnits(swap.tokenGetAmount.toString(), 18)).toFixed(6)}</span>
                            <span className="token-address" title={swap.tokenGet}>
                                {`${swap.tokenGet.slice(0, 6)}...${swap.tokenGet.slice(-4)}`}
                            </span>
                        </div>
                    </div>

                    <div className="transaction-hash">
                        {getExplorerDetails(chainId, swap.hash).url ? (
                            <a
                                href={getExplorerDetails(chainId, swap.hash).url}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="explorer-link"
                            >
                                {getExplorerDetails(chainId, swap.hash).text}
                            </a>
                        ) : (
                            <span className="explorer-link disabled">
                                {getExplorerDetails(chainId, swap.hash).text}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderSeeMoreButton = () => (
        swaps.length > INITIAL_DISPLAY_COUNT && (
            <div className="see-more-container">
                <button 
                    className="see-more-button"
                    onClick={() => setShowAllTxns(!showAllTxns)}
                >
                    {showAllTxns ? (
                        <span>Show Less ↑</span>
                    ) : (
                        <span>View All Transactions ↓</span>
                    )}
                </button>
            </div>
        )
    );

    const renderLoadingProgress = () => {
        if (!isLoadingOlder) return null;
    
        return (
            <div className="loading-progress">
                <div className="progress-text">
                    Loading older transactions... {loadingProgress.currentProgress}%
                </div>
                <div className="progress-details">
                    Blocks {loadingProgress.fromBlock} to {loadingProgress.toBlock}
                </div>
            </div>
        );
    };

    // return (
    //     <div className="charts-container">
    //         <div className="transactions-header">
    //             <h3>Recent Transactions</h3>
    //         </div>
    //         <div className="transactions-list">
    //             {swaps.map((swap) => (
    //                 <div className="transaction-card" key={swap.hash}>
    //                     <div className="transaction-main">
    //                         {/* Left side - Transaction type */}
    //                         <div className="transaction-type">
    //                             <FaExchangeAlt className="swap-icon" />
    //                             <span>Swap</span>
    //                         </div>
    
    //                         {/* Middle - Transaction amounts */}
    //                         <div className="transaction-amounts">
    //                             <div className="amount-container">
    //                                 <span className="amount">
    //                                     {ethers.utils.formatEther(swap.tokenGiveAmount)}
    //                                 </span>
    //                                 <span className="token-address" title={swap.tokenGive}>
    //                                     {`${swap.tokenGive.slice(0, 6)}...${swap.tokenGive.slice(-4)}`}
    //                                 </span>
    //                             </div>

    //                             <span className="arrow">→</span>

    //                             <div className="amount-container">
    //                                 <span className="amount">
    //                                     {ethers.utils.formatEther(swap.tokenGetAmount)}
    //                                 </span>
    //                                 <span className="token-address" title={swap.tokenGet}>
    //                                     {`${swap.tokenGet.slice(0, 6)}...${swap.tokenGet.slice(-4)}`}
    //                                 </span>
    //                             </div>
    //                         </div>
    
    //                         {/* Right side - Time and wallet */}
    //                         <div className="transaction-details">
    //                             <div className="detail">
    //                                 <BiTime className="detail-icon" />
    //                                 <span>{swap.timestamp}</span>
    //                             </div>
    //                             <div className="detail">
    //                                 <BsWallet2 className="detail-icon" />
    //                                 <span>{`${swap.user.slice(0, 6)}...${swap.user.slice(-4)}`}</span>
    //                             </div>
    //                         </div>
    //                     </div>
    
    //                     {/* Transaction hash link */}
    //                     <div className="transaction-hash">
    //                         <a 
    //                             href={`https://etherscan.io/tx/${swap.hash}`} 
    //                             target="_blank" 
    //                             rel="noopener noreferrer"
    //                         >
    //                             {`${swap.hash.slice(0, 6)}...${swap.hash.slice(-4)}`} ↗
    //                         </a>
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // );
    
    return (
        <div className="charts-container">
            <div className="transactions-header">
                <h3>Recent Transactions</h3>
                <div className="transaction-count">
                    {showAllTxns ? swaps.length : Math.min(INITIAL_DISPLAY_COUNT, swaps.length)} of {swaps.length} transactions
                </div>
            </div>

            <div className="transactions-table">
                {/* Table Header */}
                <div className="table-header">
                    <div className="header-cell">Type</div>
                    <div className="header-cell">Amount From</div>
                    <div className="header-cell">Amount To</div>
                    <div className="header-cell">Time</div>
                    <div className="header-cell">Account</div>
                </div>

                {/* Table Body */}
                <div className="table-body">
                    {isLoading ? renderLoadingState() : (
                        <>
                            {displayedSwaps.map(renderTransactionRow)}
                            {renderLoadingProgress()}
                            {renderSeeMoreButton()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Charts;