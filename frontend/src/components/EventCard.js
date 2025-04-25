import React, { useEffect, useState } from "react";
import { getEvent, getEventWithSigner, toWei } from "../utils/ethers";
import { ethers } from "ethers";

function EventCard({ address }) {
  const [meta, setMeta] = useState({});
  const [myTickets, setMyTickets] = useState([]);
  const [buying, setBuying] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [ticketDetails, setTicketDetails] = useState([]); // array of { id, owner }

  useEffect(() => {
    async function load() {
      try {
        const ev = getEvent(address);
        const [name, date, price, supply, sold] = await Promise.all([
          ev.eventName(),
          ev.eventDate(),
          ev.ticketPrice(),
          ev.maxSupply(),
          ev.sold()
        ]);
        setMeta({
          name,
          date: new Date(Number(date) * 1000).toLocaleString(),
          price: ethers.formatEther(price),
          supply: supply.toString(),
          sold: sold.toString()
        });
        const evW = await getEventWithSigner(address);
        const tickets = await evW.getMyTickets();
        setMyTickets(tickets.map((t) => t.toString()));
      } catch (err) {
        console.error("Error loading event data:", err);
      }
    }
    load();
  }, [address, buying, transferring]);

  const buy = async () => {
    setBuying(true);
    try {
      const ev = await getEventWithSigner(address);
      const tx = await ev.buyTicket({ value: toWei(meta.price) });
      await tx.wait();
    } catch (e) {
      console.error("Buying ticket failed:", e);
    }
    setBuying(false);
  };

  const send = async () => {
    const to = prompt("Enter recipient address:");
    if (!to || myTickets.length === 0) return;
    setTransferring(true);
    try {
      const ev = await getEventWithSigner(address);
      const ticketId = ethers.toBigInt(myTickets[0]);
      const tx = await ev.transferTicket(to, ticketId);
      await tx.wait();
    } catch (e) {
      console.error("Transferring ticket failed:", e);
    }
    setTransferring(false);
  };

  const loadDetails = async () => {
    try {
      const ev = await getEventWithSigner(address);
      // Attempt to call getSoldTickets (requires organizer privileges)
      const soldTickets = await ev.getSoldTickets();
      const details = [];
      for (const id of soldTickets) {
        const owner = await ev.ownerOf(id);
        details.push({ id: id.toString(), owner });
      }
      setTicketDetails(details);
    } catch (error) {
      console.warn("getSoldTickets not accessible, falling back", error);
      // Fallback: iterate over ticket ids from 1 to sold (assuming sequential IDs)
      const ev = await getEvent(address);
      const details = [];
      const count = parseInt(meta.sold) || 0;
      for (let i = 1; i <= count; i++) {
        try {
          const owner = await ev.ownerOf(i);
          details.push({ id: i.toString(), owner });
        } catch (e) {
          console.error(`Failed to get owner for ticket ${i}:`, e);
        }
      }
      setTicketDetails(details);
    }
  };

  const toggleDetails = async () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded && ticketDetails.length === 0) {
      await loadDetails();
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginBottom: 16, borderRadius: 8 }}>
      <h2>{meta.name}</h2>
      <p>
        <strong>Date:</strong> {meta.date}<br/>
        <strong>Price:</strong> {meta.price} ETH<br/>
        <strong>Supply:</strong> {meta.sold} / {meta.supply}
      </p>
      <button onClick={buy} disabled={buying}>
        {buying ? "Buying…" : "Buy Ticket"}
      </button>
      <button onClick={send} disabled={myTickets.length === 0 || transferring} style={{ marginLeft: 8 }}>
        {transferring ? "Transferring…" : "Transfer Ticket"}
      </button>
      <div style={{ marginTop: 12 }}>
        <strong>Your Tickets:</strong>
        {myTickets.length === 0 
          ? <span> none</span>
          : <ul>{myTickets.map(id => <li key={id}>#{id}</li>)}</ul>
        }
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={toggleDetails}>
          {expanded ? "Hide Details" : "View Details"}
        </button>
        {expanded && (
          <div style={{ marginTop: 8, padding: 8, border: "1px solid #ddd", borderRadius: 4 }}>
            <h4>Sold Tickets</h4>
            {ticketDetails.length === 0 
              ? <p>No ticket details available.</p>
              : (
                <ul>
                  {ticketDetails.map(ticket => (
                    <li key={ticket.id}>
                      Ticket #{ticket.id} → Owner: {ticket.owner}
                    </li>
                  ))}
                </ul>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCard;