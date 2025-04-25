import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import FactoryJSON from "./abis/EventFactory.json";
import EventJSON from "./abis/Event.json";
import "./App.css";

function App() {
  const [userAddress, setUserAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factory, setFactory] = useState(null);
  const [eventDetails, setEventDetails] = useState([]);
  const [form, setForm] = useState({ name: "", date: "", price: "", max: "" });
  const [status, setStatus] = useState("");
  const [transferRecipients, setTransferRecipients] = useState({});

  // Connect MetaMask and initialize factory
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signerInstance = await provider.getSigner();
      setSigner(signerInstance);
      const addr = await signerInstance.getAddress();
      setUserAddress(addr);

      const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
      const factoryContract = new ethers.Contract(
        factoryAddress,
        FactoryJSON.abi,
        signerInstance
      );
      setFactory(factoryContract);
      setStatus("Wallet connected");
    } catch (err) {
      console.error(err);
      setStatus("Connection failed");
    }
  };

  // Fetch all events and their details
  const loadEventDetails = async () => {
    if (!factory || !signer) return;
    try {
      const addresses = await factory.getAllEvents();
      const details = await Promise.all(
        addresses.map(async (addr) => {
          const ev = new ethers.Contract(addr, EventJSON.abi, signer);
          const [name, date, price, maxSupply, sold, myTickets] = await Promise.all([
            ev.eventName(),
            ev.eventDate(),
            ev.ticketPrice(),
            ev.maxSupply(),
            ev.sold(),
            ev.getMyTickets(),
          ]);
          return {
            address: addr,
            name,
            date: new Date(Number(date) * 1000).toLocaleString(),
            price: ethers.formatEther(price),
            maxSupply: Number(maxSupply),
            sold: Number(sold),
            myTickets: myTickets.map((t) => Number(t)),
          };
        })
      );
      setEventDetails(details);
    } catch (err) {
      console.error("Error loading event details:", err);
    }
  };

  // Auto-load events after wallet connect
  useEffect(() => {
    loadEventDetails();
  }, [factory, signer]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const createEvent = async (e) => {
    e.preventDefault();
    if (!factory) return;
    try {
      setStatus("Creating event...");
      const start = Math.floor(new Date(form.date).getTime() / 1000);
      const price = ethers.parseEther(form.price);
      const maxTickets = parseInt(form.max, 10);
      const tx = await factory.createEvent(form.name, start, price, maxTickets);
      await tx.wait();
      setStatus("Event created!");
      await loadEventDetails();
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  const buyTicket = async (address, price) => {
    try {
      setStatus("Buying ticket...");
      const ev = new ethers.Contract(address, EventJSON.abi, signer);
      const tx = await ev.buyTicket({ value: ethers.parseEther(price) });
      await tx.wait();
      setStatus("Ticket purchased!");
      await loadEventDetails();
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  const transferTicket = async (address, ticketId) => {
    const key = `${address}-${ticketId}`;
    const recipient = transferRecipients[key];
    if (!recipient) {
      alert("Enter a recipient address.");
      return;
    }
    try {
      setStatus("Transferring ticket...");
      const ev = new ethers.Contract(address, EventJSON.abi, signer);
      const tx = await ev.transferTicket(recipient, ticketId);
      await tx.wait();
      setStatus("Ticket transferred!");
      setTransferRecipients({ ...transferRecipients, [key]: "" });
      await loadEventDetails();
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Event Ticketing DApp</h1>

      {!userAddress ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <>
          <p>Connected: {userAddress}</p>

          {/* Create Event Form */}
          <form onSubmit={createEvent} className="form">
            <h2>Create New Event</h2>
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={form.name} onChange={handleChange} required />
            <label htmlFor="date">Date & Time</label>
            <input id="date" type="datetime-local" value={form.date} onChange={handleChange} required />
            <label htmlFor="price">Price (ETH)</label>
            <input id="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
            <label htmlFor="max">Max Tickets</label>
            <input id="max" type="number" min="1" value={form.max} onChange={handleChange} required />
            <button type="submit">Create Event</button>
          </form>

          <p className="status">{status}</p>

          {/* Event List & Actions */}
          <h2>Events</h2>
          {eventDetails.map((ev) => (
            <div key={ev.address} className="event-card">
              <h3>{ev.name}</h3>
              <p><strong>Address:</strong> {ev.address}</p>
              <p><strong>Date:</strong> {ev.date}</p>
              <p><strong>Price:</strong> {ev.price} ETH</p>
              <p><strong>Sold:</strong> {ev.sold} / {ev.maxSupply}</p>

              <button onClick={() => buyTicket(ev.address, ev.price)}>Buy Ticket</button>

              {ev.myTickets.length > 0 && (
                <div className="my-tickets">
                  <h4>My Tickets</h4>
                  {ev.myTickets.map((tid) => {
                    const key = `${ev.address}-${tid}`;
                    return (
                      <div key={tid} className="ticket-item">
                        <span>Ticket #{tid}</span>
                        <input
                          type="text"
                          placeholder="Recipient address"
                          value={transferRecipients[key] || ""}
                          onChange={(e) =>
                            setTransferRecipients({ ...transferRecipients, [key]: e.target.value })
                          }
                        />
                        <button onClick={() => transferTicket(ev.address, tid)}>
                          Transfer
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;