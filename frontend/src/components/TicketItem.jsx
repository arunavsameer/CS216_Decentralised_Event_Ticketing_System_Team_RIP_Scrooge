// src/components/TicketItem.jsx
import React, { useState } from "react";

export default function TicketItem({
  ticketId,
  onTransfer,
  onList,
  onCancel,
  onBuyListing,
  listing,
  currentAddress,
}) {
  const [recipient, setRecipient] = useState("");

  return (
    <div className="ticket-item">
      <span>Ticket #{ticketId}</span>
      {/* Transfer */}
      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
      />
      <button onClick={() => onTransfer(ticketId, recipient)}>
        Transfer
      </button>

      {/* List for sale */}
      {!listing ? (
        <button onClick={() => {
          const price = prompt("Enter price in ETH:");
          const expires = prompt("Enter expiration (Unix timestamp):");
          if (price && expires) onList(ticketId, price, expires);
        }}>
          List for Sale
        </button>
      ) : (
        <>
          <p>Price: {listing.price} ETH</p>
          <p>Expires: {listing.expiresAt}</p>
          {listing.seller.toLowerCase() === currentAddress.toLowerCase() ? (
            <button onClick={() => onCancel(ticketId)}>
              Cancel Listing
            </button>
          ) : (
            <button onClick={() => onBuyListing(ticketId, listing.price)}>
              Buy Ticket
            </button>
          )}
        </>
      )}
    </div>
  );
}
