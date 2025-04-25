// src/components/TicketItem.jsx
import React, { useState } from "react";
import './TicketItem.css'; 

export default function TicketItem({
  ticketId,
  eventName,
  eventDate,
  onTransfer,
  onList,
  onCancel,
  listing
}) {
  const [recipient, setRecipient] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingExpiry, setListingExpiry] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showListing, setShowListing] = useState(false);

  // Determine if the ticket is actually listed
  const isListed = listing && listing.seller && listing.seller !== "0x0000000000000000000000000000000000000000";

  const handleTransfer = () => {
    if (!recipient) return;
    onTransfer(ticketId, recipient);
    setRecipient("");
    setShowTransfer(false);
  };

  const handleListing = () => {
    if (!listingPrice || !listingExpiry) return;
    
    // Create expiry timestamp (current time + hours)
    const expiryTimestamp = Math.floor(Date.now() / 1000) + (parseInt(listingExpiry) * 3600);
    
    onList(ticketId, listingPrice, expiryTimestamp);
    setListingPrice("");
    setListingExpiry("");
    setShowListing(false);
  };

  const handleCancelListing = () => {
    onCancel(ticketId);
  };

  return (
    <div className="ticket-item">
      <div className="ticket-header">
        <div className="ticket-id">
          <span className="ticket-icon">🎫</span>
          <span>Ticket #{ticketId}</span>
        </div>
      </div>
      
      <div className="ticket-info">
        <div className="meta-item">
          <span className="meta-label">Event</span>
          <span>{eventName}</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Date</span>
          <span>{eventDate}</span>
        </div>
      </div>
      
      {isListed ? (
        <div className="listing-details">
          <div className="listing-price">
            <span className="eth-icon">Ξ</span> {listing.price} ETH
          </div>
          <div className="listing-info">
            Listed until: {listing.expiresAt}
          </div>
          <button 
            className="action-btn danger" 
            onClick={handleCancelListing}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            Cancel Listing
          </button>
        </div>
      ) : (
        <div className="ticket-actions">
          {!showTransfer && !showListing && (
            <>
              <button 
                className="action-btn primary" 
                onClick={() => setShowTransfer(true)}
              >
                Transfer Ticket
              </button>
              <button 
                className="action-btn secondary" 
                onClick={() => setShowListing(true)}
              >
                List for Sale
              </button>
            </>
          )}
          
          {showTransfer && (
            <div className="transfer-form">
              <div className="action-group">
                <input 
                  className="action-input"
                  type="text" 
                  placeholder="Recipient address 0x..." 
                  value={recipient} 
                  onChange={e => setRecipient(e.target.value)} 
                />
              </div>
              <div className="action-group" style={{ marginTop: '0.5rem' }}>
                <button className="action-btn" onClick={() => setShowTransfer(false)}>
                  Cancel
                </button>
                <button className="action-btn primary" onClick={handleTransfer}>
                  Transfer
                </button>
              </div>
            </div>
          )}
          
          {showListing && (
            <div className="listing-form">
              <div className="action-group">
                <input 
                  className="action-input"
                  type="number"
                  step="0.001"
                  placeholder="Price in ETH" 
                  value={listingPrice} 
                  onChange={e => setListingPrice(e.target.value)} 
                />
              </div>
              <div className="action-group" style={{ marginTop: '0.5rem' }}>
                <input 
                  className="action-input"
                  type="number" 
                  placeholder="Expire after (hours)" 
                  value={listingExpiry} 
                  onChange={e => setListingExpiry(e.target.value)} 
                />
              </div>
              <div className="action-group" style={{ marginTop: '0.5rem' }}>
                <button className="action-btn" onClick={() => setShowListing(false)}>
                  Cancel
                </button>
                <button className="action-btn secondary" onClick={handleListing}>
                  List Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}