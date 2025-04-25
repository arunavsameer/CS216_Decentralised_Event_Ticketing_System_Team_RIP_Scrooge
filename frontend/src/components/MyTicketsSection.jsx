import React from "react";
import './MyTicketsSection.css';

export default function MyTicketsSection({ 
  events, 
  currentAddress, 
  onTransfer, 
  onList, 
  onCancel,
  onExpandTicket
}) {
  // Filter events where the user has tickets
  const eventsWithMyTickets = events.filter(ev => ev.myTickets && ev.myTickets.length > 0);
  
  if (eventsWithMyTickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎟️</div>
        <h2 className="empty-state-title">No Tickets Found</h2>
        <p className="empty-state-text">
          You don't have any tickets yet. Purchase tickets from the Events tab to see them here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="my-tickets-section">
      <h2 className="section-title">My Tickets</h2>
      
      {eventsWithMyTickets.map(event => (
        <div key={event.address} className="event-tickets">
          <h3 className="event-name">{event.name}</h3>
          <div className="tickets-grid">
            {event.myTickets.map(ticketId => {
              const listing = event.myListings.find(l => l.ticketId === ticketId);
              const isListed = listing && listing.seller !== "0x0000000000000000000000000000000000000000";
              
              return (
                <div 
                  key={ticketId} 
                  className={`ticket-card ${isListed ? 'listed' : ''}`}
                  onClick={() => onExpandTicket(event.address, ticketId)}
                >
                  <div className="ticket-header">
                    <span className="ticket-id">Ticket #{ticketId}</span>
                    {isListed && (
                      <span className="listing-badge">Listed</span>
                    )}
                  </div>
                  <div className="ticket-details">
                    <p className="ticket-event">{event.name}</p>
                    <p className="ticket-date">{event.date}</p>
                    {isListed && (
                      <p className="listing-price">{listing.price} ETH</p>
                    )}
                  </div>
                  <div className="ticket-footer">
                    <span className="view-details">View Details</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
