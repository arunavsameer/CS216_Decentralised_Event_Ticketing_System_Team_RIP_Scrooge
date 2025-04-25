// src/components/ConnectWalletButton.jsx
import React from "react";

export default function ConnectWalletButton({ onConnect }) {
  return (
    <button className="connect-btn" onClick={onConnect}>
      <span role="img" aria-label="wallet">👛</span> Connect MetaMask
    </button>
  );
}