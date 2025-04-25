// src/components/EventCard.jsx
import React from "react";
import MyTickets from "./MyTickets";

export default function EventCard({
  ev,
  onBuyTicket,
  onTransfer,
  onList,
  onCancel,
  onBuyListing,
  currentAddress
}) {
  return (
    <div className="event-card">
      <h3>{ev.name}</h3>
      <p><strong>Address:</strong> {ev.address}</p>
      <p><strong>Date:</strong> {ev.date}</p>
      <p><strong>Price:</strong> {ev.price} ETH</p>
      <p><strong>Sold:</strong> {ev.sold} / {ev.maxSupply}</p>

      <button onClick={() => onBuyTicket(ev.address, ev.price)}>
        Buy Ticket
      </button>

      {ev.myTickets.length > 0 && (
        <MyTickets
          eventAddress={ev.address}
          tickets={ev.myTickets}
          listings={ev.listings}
          currentAddress={currentAddress}
          onTransfer={onTransfer}
          onList={onList}
          onCancel={onCancel}
          onBuyListing={onBuyListing}
        />
      )}
    </div>
  );
}
