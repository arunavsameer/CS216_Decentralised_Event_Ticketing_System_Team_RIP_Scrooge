// src/components/MarketplaceSection.jsx
import React from "react";

export default function MarketplaceSection({ 
  events, 
  currentAddress, 
  onCancel, 
  onBuyListing 
}) {
  // Filter events with marketplace listings
  const eventsWithListings = events.filter(ev => 
    ev.marketplaceListings && ev.marketplaceListings.length > 0
  );
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <section className="marketplace">
      <h2 className="section-title">🛒 Marketplace</h2>
      
      {eventsWithListings.length > 0 ? (
        eventsWithListings.map(event => (
          <div key={event.address} className="marketplace-event">
            <h3>{event.name}</h3>
            <div className="marketplace-grid">
              {event.marketplaceListings.map(listing => (
                <div key={listing.ticketId} className="listing-card">
                  <div className="listing-header">
                    <div className="ticket-id">
                      <span className="ticket-icon">🎫</span>
                      <span>Ticket #{listing.ticketId}</span>
                    </div>
                    <div className="listing-price-tag">
                      <span className="eth-icon">Ξ</span> {listing.price}
                    </div>
                  </div>
                  
                  <div className="listing-meta">
                    <div className="meta-item">
                      <span className="meta-label">Seller</span>
                      <span>{formatAddress(listing.seller)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Expires</span>
                      <span>{listing.expiresAt}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Event</span>
                      <span>{event.name}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Date</span>
                      <span>{event.date}</span>
                    </div>
                  </div>
                  
                  {listing.seller.toLowerCase() === currentAddress.toLowerCase() ? (
                    <button 
                      className="action-btn danger" 
                      style={{ width: '100%' }}
                      onClick={() => onCancel(event.address, listing.ticketId)}
                    >
                      Cancel Listing
                    </button>
                  ) : (
                    <button 
                      className="action-btn primary" 
                      style={{ width: '100%' }}
                      onClick={() => onBuyListing(event.address, listing.ticketId, listing.price)}
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="marketplace-empty">
          <p>No tickets currently listed for sale</p>
        </div>
      )}
    </section>
  );
}