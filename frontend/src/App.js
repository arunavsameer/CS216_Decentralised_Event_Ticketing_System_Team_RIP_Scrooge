import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import ConnectWalletButton from "./components/ConnectWalletButton";
import CreateEventForm from "./components/CreateEventForm";
import EventCard from "./components/EventCard";
import MarketplaceSection from "./components/MarketplaceSection";
import MyTicketsSection from "./components/MyTicketsSection";

import FactoryJSON from "./abis/EventFactory.json";
import EventJSON from "./abis/Event.json";

import "./App.css";

function App() {
  const [userAddress, setUserAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factory, setFactory] = useState(null);
  const [eventDetails, setEventDetails] = useState([]);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // info, success, error
  const [activeTab, setActiveTab] = useState("events"); // events, myTickets, marketplace, createEvent

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("Please install MetaMask");
      setStatusType("error");
      return;
    }
    
    try {
      setStatus("Connecting wallet...");
      setStatusType("info");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const s = await provider.getSigner();
      setSigner(s);
      
      const address = await s.getAddress();
      setUserAddress(address);

      const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
      setFactory(new ethers.Contract(factoryAddress, FactoryJSON.abi, s));
      
      setStatus("Wallet connected successfully");
      setStatusType("success");
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Failed to connect wallet: " + error.message);
      setStatusType("error");
    }
  };

  // Load all event data
  // Update this function in your App.js file
  const loadEventDetails = useCallback(async () => {
    if (!factory || !signer) return;

    try {
      setStatus("Loading events...");
      setStatusType("info");
      
      const addrs = await factory.getAllEvents();
      const details = await Promise.all(
        addrs.map(async (addr) => {
          const ev = new ethers.Contract(addr, EventJSON.abi, signer);

          const [
            name,
            date,
            price,
            maxSupply,
            sold,
            myTicketsRaw,
          ] = await Promise.all([
            ev.eventName(),
            ev.eventDate(),
            ev.ticketPrice(),
            ev.maxSupply(),
            ev.sold(),
            ev.getMyTickets(),
          ]);

          const myTickets = myTicketsRaw.map((t) => Number(t));

          const myListings = await Promise.all(
            myTickets.map(async (tid) => {
              const listing = await ev.getListing(tid);
              return {
                ticketId: tid,
                seller: listing.seller,
                price: ethers.formatEther(listing.price),
                expiresAt: new Date(Number(listing.expiresAt) * 1000).toLocaleString(),
                rawExpiresAt: Number(listing.expiresAt)
              };
            })
          );

          const marketplaceListings = [];
          for (let tid = 1; tid <= Number(sold); tid++) {
            const listing = await ev.getListing(tid);
            if (listing.seller && listing.seller !== ethers.ZeroAddress) {
              marketplaceListings.push({
                ticketId: tid,
                seller: listing.seller,
                price: ethers.formatEther(listing.price),
                expiresAt: new Date(Number(listing.expiresAt) * 1000).toLocaleString(),
                rawExpiresAt: Number(listing.expiresAt)
              });
            }
          }

          return {
            address: addr,
            name,
            date: new Date(Number(date) * 1000).toLocaleString(),
            rawDate: Number(date),
            price: ethers.formatEther(price),
            maxSupply: Number(maxSupply),
            sold: Number(sold),
            myTickets,
            myListings,
            marketplaceListings,
          };
        })
      );

      setEventDetails(details);
      setStatus("");
    } catch (err) {
      console.error("Error loading event details:", err);
      setStatus("Failed to load events: " + err.message);
      setStatusType("error");
    }
  }, [factory, signer]);

  useEffect(() => {
    if (factory && signer) {
      loadEventDetails();
    }
  }, [factory, signer, loadEventDetails]);

  // Handlers
  const createEvent = async ({ name, date, price, max }) => {
    try {
      setStatus("Creating event...");
      setStatusType("info");
      
      const tx = await factory.createEvent(
        name,
        Math.floor(date),
        ethers.parseEther(price),
        parseInt(max, 10)
      );
      
      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      
      setStatus("Event created successfully!");
      setStatusType("success");
      loadEventDetails();
    } catch (err) {
      console.error("Error creating event:", err);
      setStatus("Failed to create event: " + err.message);
      setStatusType("error");
    }
  };

  const buyTicket = async (addr, price) => {
    try {
      setStatus("Buying ticket...");
      setStatusType("info");
      
      const ev = new ethers.Contract(addr, EventJSON.abi, signer);
      const tx = await ev.buyTicket({ value: ethers.parseEther(price) });
      
      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      
      setStatus("Ticket purchased successfully!");
      setStatusType("success");
      loadEventDetails();
    } catch (err) {
      console.error("Error buying ticket:", err);
      setStatus("Failed to buy ticket: " + err.message);
      setStatusType("error");
    }
  };

  const transferTicket = async (addr, tid, to) => {
    try {
      setStatus("Transferring ticket...");
      setStatusType("info");
      
      const ev = new ethers.Contract(addr, EventJSON.abi, signer);
      const tx = await ev.transferTicket(to, tid);
      
      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      
      setStatus("Ticket transferred successfully!");
      setStatusType("success");
      loadEventDetails();
    } catch (err) {
      console.error("Error transferring ticket:", err);
      setStatus("Failed to transfer ticket: " + err.message);
      setStatusType("error");
    }
  };

  const listTicket = async (addr, tid, price, expires) => {
    try {
      setStatus("Approving ticket for listing...");
      setStatusType("info");
      
      const ev = new ethers.Contract(addr, EventJSON.abi, signer);
      const approvalTx = await ev.approve(addr, tid);
      
      setStatus("Approval submitted. Waiting for confirmation...");
      await approvalTx.wait();

      setStatus("Listing ticket...");
      const tx = await ev.listTicket(tid, ethers.parseEther(price), Number(expires));
      
      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("Ticket listed successfully!");
      setStatusType("success");
      loadEventDetails();
    } catch (err) {
      console.error("Error listing ticket:", err);
      setStatus("Failed to list ticket: " + err.message);
      setStatusType("error");
    }
  };

  const cancelListing = async (addr, tid) => {
    try {
      setStatus("Canceling listing...");
      setStatusType("info");
      
      const ev = new ethers.Contract(addr, EventJSON.abi, signer);
      const tx = await ev.cancelListing(tid);
      
      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      
      setStatus("Listing canceled successfully!");
      setStatusType("success");
      loadEventDetails();
    } catch (err) {
      console.error("Error canceling listing:", err);
      setStatus("Failed to cancel listing: " + err.message);
      setStatusType("error");
    }
  };

  const buyListedTicket = async (addr, tid, price) => {
    try {
      setStatus("Buying listed ticket...");
      setStatusType("info");
      
      const ev = new ethers.Contract(addr, EventJSON.abi, signer);
      const tx = await ev.buyListedTicket(tid, { value: ethers.parseEther(price) });
      
      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      
      setStatus("Ticket purchased from marketplace successfully!");
      setStatusType("success");
      loadEventDetails();
    } catch (err) {
      console.error("Error buying listed ticket:", err);
      setStatus("Failed to buy listed ticket: " + err.message);
      setStatusType("error");
    }
  };

  // Helper to format address
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Count all my tickets across all events
  const totalMyTickets = eventDetails.reduce((sum, event) => sum + event.myTickets.length, 0);
  
  // Count all marketplace listings
  const totalMarketListings = eventDetails.reduce(
    (sum, event) => sum + event.marketplaceListings.length, 
    0
  );

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">
          <span role="img" aria-label="Ticket">🎫</span> Event Ticketing DApp
        </h1>
        
        {!userAddress ? (
          <ConnectWalletButton onConnect={connectWallet} />
        ) : (
          <div className="wallet-info">
            <span>Connected:</span>
            <span className="address-display">{formatAddress(userAddress)}</span>
          </div>
        )}
      </header>

      {status && (
        <div className={`status-message status-${statusType}`}>
          {status}
        </div>
      )}

      {userAddress && (
        <>
          <nav className="app-navigation">
            <ul className="nav-tabs">
              <li 
                className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                <span role="img" aria-label="Events">🎭</span> Events
              </li>
              <li 
                className={`nav-item ${activeTab === 'myTickets' ? 'active' : ''}`}
                onClick={() => setActiveTab('myTickets')}
              >
                <span role="img" aria-label="My Tickets">🎟️</span> My Tickets
                {totalMyTickets > 0 && <span className="badge">{totalMyTickets}</span>}
              </li>
              <li 
                className={`nav-item ${activeTab === 'marketplace' ? 'active' : ''}`}
                onClick={() => setActiveTab('marketplace')}
              >
                <span role="img" aria-label="Marketplace">🛒</span> Marketplace
                {totalMarketListings > 0 && <span className="badge">{totalMarketListings}</span>}
              </li>
              <li 
                className={`nav-item ${activeTab === 'createEvent' ? 'active' : ''}`}
                onClick={() => setActiveTab('createEvent')}
              >
                <span role="img" aria-label="Create">➕</span> Create Event
              </li>
            </ul>
          </nav>

          {activeTab === 'events' && (
            <section className="events-section">
              <h2 className="section-title">Available Events</h2>
              <div className="events-grid">
                {eventDetails.map(event => (
                  <EventCard
                    key={event.address}
                    event={event}
                    currentAddress={userAddress}
                    onBuyTicket={buyTicket}
                    minimal={true}
                  />
                ))}
              </div>
            </section>
          )}

          {activeTab === 'myTickets' && (
            <section className="my-tickets-section">
              <h2 className="section-title">My Tickets</h2>
              <MyTicketsSection
                events={eventDetails}
                currentAddress={userAddress}
                onTransfer={transferTicket}
                onList={listTicket}
                onCancel={cancelListing}
              />
            </section>
          )}

          {activeTab === 'marketplace' && (
            <MarketplaceSection
              events={eventDetails}
              currentAddress={userAddress}
              onCancel={cancelListing}
              onBuyListing={buyListedTicket}
            />
          )}

          {activeTab === 'createEvent' && (
            <section className="create-event-section">
              <CreateEventForm onCreate={createEvent} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;