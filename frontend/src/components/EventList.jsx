// src/components/EventList.js
import React, { useState } from "react";

const EventList = ({
  events,
  currentAddress,
  onBuyTicket,
  onTransfer,
  onList,
  onCancel,
  onBuyListing,
}) => {
  const [listingPrice, setListingPrice] = useState({});
  const [listingExpiry, setListingExpiry] = useState({});
  const [transferTo, setTransferTo] = useState({});

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.address} className="event-card">
          <h2>{event.name}</h2>
          <p>Date: {event.date}</p>
          <p>Price: {event.price} ETH</p>
          <p>
            Sold: {event.sold} / {event.maxSupply}
          </p>

          <button onClick={() => onBuyTicket(event.address, event.price)}>
            Buy Ticket
          </button>

          {/* ─── MY TICKETS ───────────────────────────────────── */}
          {event.myTickets.length > 0 && (
            <div className="my-tickets">
              <h3>My Tickets</h3>
              {event.myTickets.map((tid) => {
                const listing = event.listings.find((l) => l.ticketId === tid);
                const isListed =
                  listing &&
                  listing.seller.toLowerCase() === currentAddress.toLowerCase();

                return (
                  <div key={tid} className="ticket-card">
                    <p>🎫 Ticket #{tid}</p>

                    {/* Transfer section */}
                    <input
                      type="text"
                      placeholder="Transfer to address"
                      value={transferTo[tid] || ""}
                      onChange={(e) =>
                        setTransferTo((prev) => ({
                          ...prev,
                          [tid]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() =>
                        onTransfer(event.address, tid, transferTo[tid])
                      }
                    >
                      Transfer
                    </button>

                    {/* List / Unlist Logic */}
                    {isListed ? (
                      <>
                        <p>
                          Listed for {listing.price} ETH (expires{" "}
                          {listing.expiresAt})
                        </p>
                        <button
                          onClick={() => onCancel(event.address, tid)}
                        >
                          Cancel Listing
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Price (ETH)"
                          value={listingPrice[tid] || ""}
                          onChange={(e) =>
                            setListingPrice((prev) => ({
                              ...prev,
                              [tid]: e.target.value,
                            }))
                          }
                        />
                        <input
                          type="number"
                          placeholder="Expires in seconds"
                          value={listingExpiry[tid] || ""}
                          onChange={(e) =>
                            setListingExpiry((prev) => ({
                              ...prev,
                              [tid]: e.target.value,
                            }))
                          }
                        />
                        <button
                          onClick={() =>
                            onList(
                              event.address,
                              tid,
                              listingPrice[tid],
                              Math.floor(Date.now() / 1000) +
                                Number(listingExpiry[tid])
                            )
                          }
                        >
                          List Ticket
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventList;
