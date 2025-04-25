import React from "react";
import './EventCard.css';

export default function EventCard({ event, currentAddress, onBuyTicket, onExpand }) {
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
  const isExpired = event.rawDate < Math.floor(Date.now() / 1000);

  return (
    <div className="event-card" onClick={onExpand}>
      <div className="event-image">
        <div className="event-time-left">
          {isExpired ? "Expired" : formatTimeLeft(event.rawDate)}
        </div>
      </div>
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
          <span className="detail-value">{event.price} ETH</span>
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
      </div>
      <div className="event-footer">
        <button 
          className="buy-btn"
          onClick={(e) => {
            e.stopPropagation();
            onBuyTicket();
          }}
          disabled={isExpired || event.sold >= event.maxSupply}
        >
          {isExpired ? "Event Ended" : 
           event.sold >= event.maxSupply ? "Sold Out" : "Buy Ticket"}
        </button>
      </div>
    </div>
  );
}
