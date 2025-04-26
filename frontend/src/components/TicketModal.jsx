import React, { useState, useEffect } from "react";
import './TicketModal.css';

export default function TicketModal({
  isOpen,
  onClose,
  event,
  ticketId,
  onTransfer,
  onList,
  onCancel,
  currentAddress
}) {
  const [recipient, setRecipient] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingExpiry, setListingExpiry] = useState("24"); // Default 24 hours
  const [activeTab, setActiveTab] = useState("details");
  
  // Image loading states
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  
  // Extract banner image URL based on the event structure
  const bannerImageUrl = event?.metadata?.bannerImage || event?.bannerImage || event?.metadata?.cardImage || event?.cardImage || "";

  // Find if this ticket is listed
  const myTickets = event?.myTickets || [];
  const isMyTicket = myTickets.includes(Number(ticketId));
  const listing = event?.myListings?.find(l => l.ticketId === Number(ticketId)) ||
    event?.marketplaceListings?.find(l => l.ticketId === Number(ticketId));
  const isListed = listing && listing.seller !== "0x0000000000000000000000000000000000000000";

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipient("");
      setListingPrice("");
      setListingExpiry("24");
      
      // Reset image states
      setBannerLoaded(false);
      setBannerError(false);
      
      // Preload banner image
      if (bannerImageUrl) {
        const img = new Image();
        img.onload = () => setBannerLoaded(true);
        img.onerror = () => setBannerError(true);
        img.src = bannerImageUrl;
      }
      
      // Prevent body scrolling when modal is open
      document.body.classList.add('body-modal-open');
    } else {
      // Re-enable body scrolling when modal closes
      document.body.classList.remove('body-modal-open');
    }
    
    // Cleanup function to ensure body scrolling is re-enabled
    return () => {
      document.body.classList.remove('body-modal-open');
    };
  }, [isOpen, bannerImageUrl]);
  
  // Apply banner image style
  const bannerStyle = bannerImageUrl && bannerLoaded && !bannerError 
    ? { 
        backgroundImage: `url(${bannerImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {}; // Empty object will use default styling from CSS

  const handleTransfer = () => {
    if (!recipient) return;
    onTransfer(recipient);
    setRecipient("");
  };

  const handleListing = () => {
    if (!listingPrice || !listingExpiry) return;
    // Create expiry timestamp (current time + hours)
    const expiryTimestamp = Math.floor(Date.now() / 1000) + (parseInt(listingExpiry) * 3600);
    onList(listingPrice, expiryTimestamp);
  };

  const handleCancelListing = () => {
    onCancel();
  };

  // If modal is not open or no event is provided, don't render
  if (!isOpen || !event) return null;

  return (
    <div className="ticket-modal-overlay" onClick={(e) => {
      // Close modal when clicking on overlay background
      if (e.target.className === 'ticket-modal-overlay') {
        onClose();
      }
    }}>
      <div className="ticket-modal">
        <div className="modal-header">
          <h2 className="modal-title">Ticket #{ticketId}</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="ticket-tabs">
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            {isMyTicket && (
              <button
                className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                Manage
              </button>
            )}
          </div>

          {activeTab === 'details' && (
            <div className="ticket-details-tab">
              <div className="event-banner-small" style={bannerStyle}></div>
              <div className="ticket-info-grid">
                <div className="info-item">
                  <h3>Event</h3>
                  <p>{event.name}</p>
                </div>
                <div className="info-item">
                  <h3>Date & Time</h3>
                  <p>{event.date}</p>
                </div>
                <div className="info-item">
                  <h3>Ticket ID</h3>
                  <p>#{ticketId}</p>
                </div>
                {isListed && (
                  <>
                    <div className="info-item">
                      <h3>Listed Price</h3>
                      <p className="price-value">{listing.price} ETH</p>
                    </div>
                    <div className="info-item">
                      <h3>Listing Expires</h3>
                      <p>{listing.expiresAt}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'manage' && isMyTicket && (
            <div className="ticket-manage-tab">
              {isListed ? (
                <div className="manage-section">
                  <h3>Active Listing</h3>
                  <div className="listing-info">
                    <p>Your ticket is currently listed for {listing.price} ETH</p>
                    <p>Listing expires: {listing.expiresAt}</p>
                  </div>
                  <button className="action-button danger" onClick={handleCancelListing}>
                    Cancel Listing
                  </button>
                </div>
              ) : (
                <>
                  <div className="manage-section">
                    <h3>List on Marketplace</h3>
                    <div className="form-container">
                      <div className="form-group">
                        <label>Price (ETH)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0.1"
                          value={listingPrice}
                          onChange={(e) => setListingPrice(e.target.value)}
                          className="modern-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Listing Duration (hours)</label>
                        <input
                          type="number"
                          placeholder="24"
                          value={listingExpiry}
                          onChange={(e) => setListingExpiry(e.target.value)}
                          className="modern-input"
                        />
                      </div>
                      <button className="action-button primary" onClick={handleListing}>
                        List Ticket
                      </button>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="manage-section">
                    <h3>Transfer Ticket</h3>
                    <div className="form-group">
                      <label>Recipient Address</label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="modern-input"
                      />
                    </div>
                    <button className="action-button secondary" onClick={handleTransfer}>
                      Transfer Ticket
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}