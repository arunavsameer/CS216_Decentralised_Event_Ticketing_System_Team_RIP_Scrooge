// Update ConnectWalletButton.jsx to properly handle clicks
import React from "react";
import './ConnectWalletButton.css';

export default function ConnectWalletButton({ onClick }) {  // Changed prop name
  return (
    <button 
      className="connect-btn"
      onClick={onClick}  // Use the passed onClick handler
    >
      👛 Connect MetaMask
    </button>
  );
}
