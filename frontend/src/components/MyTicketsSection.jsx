// src/components/MyTicketsSection.jsx
import React from "react";
import TicketItem from "./TicketItem";
import './MyTicketsSection.css'; 

export default function MyTicketsSection({ 
  events, 
  currentAddress, 
  onTransfer, 
  onList, 
  onCancel 
}) {
  // Filter events where the user has tickets
  const eventsWithMyTickets = events.filter(ev => 
    ev.myTickets && ev.myTickets.length > 0
  );

  return (
    <div className="my-tickets-section">
      {eventsWithMyTickets.length > 0 ? (
        eventsWithMyTickets.map(event => (
          <div key={event.address} className="event-tickets">
            <h3>{event.name}</h3>
            <div className="tickets-grid">
              {event.myTickets.map(ticketId => {
                // Find listing for this ticket if it exists
                const listing = event.myListings && event.myListings.find(l => 
                  l.ticketId === ticketId && 
                  l.seller && 
                  l.seller !== "0x0000000000000000000000000000000000000000"
                );
                
                return (
                  <TicketItem
                    key={ticketId}
                    ticketId={ticketId}
                    eventName={event.name}
                    eventDate={event.date}
                    listing={listing}
                    onTransfer={(tid, recipient) => onTransfer(event.address, tid, recipient)}
                    onList={(tid, price, expires) => onList(event.address, tid, price, expires)}
                    onCancel={(tid) => onCancel(event.address, tid)}
                  />
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="no-tickets">
          <p>You don't have any tickets yet.</p>
          <p>Purchase tickets from the Events tab to see them here.</p>
        </div>
      )}
    </div>
  );
}