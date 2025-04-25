// src/components/ConnectWalletButton.jsx
import React from "react";

export default function ConnectWalletButton({ onConnect }) {
  return (
    <button onClick={onConnect}>Connect MetaMask</button>
  );
}
