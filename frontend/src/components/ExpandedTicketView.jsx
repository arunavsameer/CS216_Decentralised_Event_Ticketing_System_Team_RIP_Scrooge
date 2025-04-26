import React, { useState } from "react";
import './ExpandedTicketView.css';
import { transferTicket, listTicket, cancelListing } from "../utils/TicketUtils";

export default function ExpandedTicketView({
  event,
  ticketId,
  onBack,
  onTransfer,
  onList,
  onCancel,
  currentAddress,
  signer
}) {
  const [recipient, setRecipient] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingExpiry, setListingExpiry] = useState("24"); // Default 24 hours
  const [activeTab, setActiveTab] = useState("details");

  // Find if this ticket is listed
  const myTickets = event.myTickets || [];
  const isMyTicket = myTickets.includes(Number(ticketId));
  const listing = event.myListings?.find(l => l.ticketId === Number(ticketId)) ||
    event.marketplaceListings?.find(l => l.ticketId === Number(ticketId));
  const isListed = listing && listing.seller !== "0x0000000000000000000000000000000000000000";

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

  return (
    <div className="expanded-ticket">
      <div className="expanded-header">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      <div className="ticket-container">
        <div className="ticket-hero">
          <div className="ticket-banner"></div>
          <div className="ticket-header-info">
            <h1 className="ticket-title">Ticket #{ticketId}</h1>
            {/* <h2 className="event-name">{event.name}</h2> */}
          </div>
        </div>

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

        <div className="ticket-content">
          {activeTab === 'details' && (
            <div className="ticket-details-tab">
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
                  <button className="cancel-btn" onClick={handleCancelListing}>
                    Cancel Listing
                  </button>
                </div>
              ) : (
                <>
                  <div className="manage-section">
                    <h3>List on Marketplace</h3>
                    <div className="formcontainer">
                      <div className="form-group">
                        <label>Price (ETH)</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0.1"
                          value={listingPrice}
                          onChange={(e) => setListingPrice(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Listing Duration (hours)</label>
                        <input
                          type="number"
                          placeholder="24"
                          value={listingExpiry}
                          onChange={(e) => setListingExpiry(e.target.value)}
                        />
                      </div>
                      <button className="list-btn" onClick={handleListing}>
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
                      />
                    </div>
                    <button className="transfer-btn" onClick={handleTransfer}>
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