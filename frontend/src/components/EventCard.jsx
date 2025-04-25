// src/components/EventCard.jsx
import React from "react";

export default function EventCard({
  event,
  currentAddress,
  onBuyTicket,
  minimal = false // New prop to show minimal view
}) {
  const formatTimeLeft = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const progressPercentage = (event.sold / event.maxSupply) * 100;
  
  return (
    <div className="event-card">
      <div className="event-header">
        <h3 className="event-title">{event.name}</h3>
      </div>
      
      <div className="event-details">
        <div className="detail-item">
          <span className="detail-label">Date</span>
          <span className="detail-value">{event.date}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Price</span>
          <span className="detail-value">
            <span className="eth-icon">Ξ</span> {event.price} ETH
          </span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Availability</span>
          <span className="detail-value">{event.sold} / {event.maxSupply}</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {event.sold < event.maxSupply && (
          <div className="detail-item">
            <span className="detail-label">Time until event</span>
            <span className="detail-value">{formatTimeLeft(event.rawDate)}</span>
          </div>
        )}
      </div>
      
      <div className="event-footer">
        {event.sold < event.maxSupply ? (
          <button 
            className="buy-btn" 
            onClick={() => onBuyTicket(event.address, event.price)}
          >
            Buy Ticket
          </button>
        ) : (
          <button className="buy-btn" disabled>Sold Out</button>
        )}
      </div>
      
      {/* In minimal view, we don't show the tickets section */}
      {!minimal && event.myTickets && event.myTickets.length > 0 && (
        <div className="my-tickets">
          <h4 className="tickets-title">My Tickets ({event.myTickets.length})</h4>
          <div className="tickets-grid">
            {/* This part is removed in minimal view */}
          </div>
        </div>
      )}
    </div>
  );
}