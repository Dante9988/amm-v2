import React from 'react';
import { useSelector } from 'react-redux';
import '../css/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const balances = useSelector(state => state.tokens.balances);
    const symbols = useSelector(state => state.tokens.symbols);
  
    return (
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? '«' : '»'}
        </button>
        {isOpen && (
          <div className="content">
            <h2>Wallet</h2>
            <ul>
              {balances.map((balance, index) => (
                <li key={index}>
                  {symbols[index]}: {balance}
                  <span>Balance</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  export default Sidebar;