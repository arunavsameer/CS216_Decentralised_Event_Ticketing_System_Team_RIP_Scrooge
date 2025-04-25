// src/components/MyTickets.jsx
import React from "react";
import TicketItem from "./TicketItem";

export default function MyTickets({
  eventAddress,
  tickets,
  listings,
  currentAddress,
  onTransfer,
  onList,
  onCancel,
  onBuyListing,
}) {
  return (
    <div className="my-tickets">
      <h4>My Tickets</h4>
      {tickets.map(tid => (
        <TicketItem
          key={tid}
          ticketId={tid}
          listing={listings.find(l => l.ticketId === tid) || null}
          currentAddress={currentAddress}
          onTransfer={(ticketId, recipient) => onTransfer(eventAddress, ticketId, recipient)}
          onList={(ticketId, price, expires) => onList(eventAddress, ticketId, price, expires)}
          onCancel={ticketId => onCancel(eventAddress, ticketId)}
          onBuyListing={(ticketId, price) => onBuyListing(eventAddress, ticketId, price)}
        />
      ))}
    </div>
  );
}
