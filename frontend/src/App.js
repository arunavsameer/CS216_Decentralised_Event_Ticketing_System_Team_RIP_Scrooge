import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import ConnectWalletButton from "./components/ConnectWalletButton";
import CreateEventForm from "./components/CreateEventForm";
import EventCard from "./components/EventCard";
import ExpandedEventView from "./components/ExpandedEventView";
import ExpandedTicketView from "./components/ExpandedTicketView";
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
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [previousTab, setPreviousTab] = useState(null);

  // Connect wallet
  // In App.js - Update the connectWallet function
const connectWallet = async () => {
  // Check if MetaMask is installed
  if (!window.ethereum?.isMetaMask) {
    setStatus("Please install MetaMask extension");
    setStatusType("error");
    return;
  }

  try {
    setStatus("Connecting wallet...");
    setStatusType("info");
    
    // Directly use window.ethereum instead of ethers.BrowserProvider
    const accounts = await window.ethereum.request({ 
      method: "eth_requestAccounts" 
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    // Initialize ethers provider after successful connection
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setSigner(signer);
    setUserAddress(address);
    
    // Initialize contract after wallet connection
    const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
    setFactory(new ethers.Contract(factoryAddress, FactoryJSON.abi, signer));
    
    setStatus("Wallet connected successfully");
    setStatusType("success");

  } catch (error) {
    console.error("Connection error:", error);
    setStatus(error.message || "Failed to connect wallet");
    setStatusType("error");
    
    // Reset connection state on error
    setUserAddress(null);
    setSigner(null);
    setFactory(null);
  }
};


  // Load all event data
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

  // Handle expanding an event
  const handleExpandEvent = (eventAddress) => {
    setPreviousTab(activeTab);
    setExpandedEvent(eventDetails.find(e => e.address === eventAddress));
    // Use history API to enable back button functionality
    window.history.pushState({ type: 'event', id: eventAddress }, '', `#event/${eventAddress}`);
  };
  
  // Handle expanding a ticket
  const handleExpandTicket = (eventAddress, ticketId) => {
    setPreviousTab(activeTab);
    const event = eventDetails.find(e => e.address === eventAddress);
    setExpandedTicket({ event, ticketId });
    // Use history API to enable back button functionality
    window.history.pushState({ type: 'ticket', eventId: eventAddress, ticketId }, '', `#ticket/${eventAddress}/${ticketId}`);
  };
  
  // Handle back button
  const handleBack = () => {
    if (expandedTicket) {
      setExpandedTicket(null);
      setExpandedEvent(expandedTicket.event);
      window.history.pushState({ type: 'event', id: expandedTicket.event.address }, '', `#event/${expandedTicket.event.address}`);
    } else if (expandedEvent) {
      setExpandedEvent(null);
      setActiveTab(previousTab || "events");
      window.history.pushState({}, '', '#');
    }
  };

  // In App.js - Add this useEffect
useEffect(() => {
  if (!window.ethereum) return;

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // MetaMask locked or user disconnected all accounts
      setUserAddress(null);
      setSigner(null);
      setFactory(null);
    }
  };

  const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);


  // Listen for popstate (browser back button)
  useEffect(() => {
    const handlePopState = (event) => {
      if (!event.state) {
        setExpandedEvent(null);
        setExpandedTicket(null);
        return;
      }
      
      if (event.state.type === 'event') {
        setExpandedTicket(null);
        setExpandedEvent(eventDetails.find(e => e.address === event.state.id));
      } else if (event.state.type === 'ticket') {
        const event = eventDetails.find(e => e.address === event.state.eventId);
        setExpandedTicket({ event, ticketId: event.state.ticketId });
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [eventDetails]);

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
    (sum, event) => sum + event.marketplaceListings.length, 0
  );

  // Render the main content based on expanded state
  const renderMainContent = () => {
    if (expandedTicket) {
      return (
        <ExpandedTicketView 
          event={expandedTicket.event} 
          ticketId={expandedTicket.ticketId}
          onBack={handleBack}
          onTransfer={(to) => transferTicket(expandedTicket.event.address, expandedTicket.ticketId, to)}
          onList={(price, expires) => listTicket(expandedTicket.event.address, expandedTicket.ticketId, price, expires)}
          onCancel={() => cancelListing(expandedTicket.event.address, expandedTicket.ticketId)}
          currentAddress={userAddress}
        />
      );
    }
    
    if (expandedEvent) {
      return (
        <ExpandedEventView 
          event={expandedEvent}
          onBack={handleBack}
          onBuyTicket={() => buyTicket(expandedEvent.address, expandedEvent.price)}
          onExpandTicket={(ticketId) => handleExpandTicket(expandedEvent.address, ticketId)}
          currentAddress={userAddress}
        />
      );
    }
    
    // Regular tab content
    switch (activeTab) {
      case "events":
        return (
          <div className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            <div className="events-grid">
              {eventDetails.map((event) => (
                <EventCard
                  key={event.address}
                  event={event}
                  currentAddress={userAddress}
                  onBuyTicket={() => buyTicket(event.address, event.price)}
                  onExpand={() => handleExpandEvent(event.address)}
                />
              ))}
            </div>
          </div>
        );
      case "myTickets":
        return (
          <MyTicketsSection
            events={eventDetails}
            currentAddress={userAddress}
            onTransfer={transferTicket}
            onList={listTicket}
            onCancel={cancelListing}
            onExpandTicket={handleExpandTicket}
          />
        );
      case "marketplace":
        return (
          <MarketplaceSection
            events={eventDetails}
            currentAddress={userAddress}
            onBuy={buyListedTicket}
            onExpandEvent={handleExpandEvent}
            onExpandTicket={handleExpandTicket}
          />
        );
      case "createEvent":
        return <CreateEventForm onCreate={createEvent} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1 className="app-title">
            <span>NFTickets</span>
          </h1>
          {userAddress ? (
            <div className="wallet-info">
              <span className="address-display">{formatAddress(userAddress)}</span>
            </div>
          ) : (
            <ConnectWalletButton onClick={connectWallet} />  // Pass connectWallet as onClick
          )}
        </header>

        {userAddress && (
          <nav className="app-navigation">
            <ul className="nav-tabs">
              <li
                className={`nav-item ${activeTab === "events" ? "active" : ""}`}
                onClick={() => setActiveTab("events")}
              >
                Events
              </li>
              <li
                className={`nav-item ${activeTab === "myTickets" ? "active" : ""}`}
                onClick={() => setActiveTab("myTickets")}
              >
                My Tickets
                {totalMyTickets > 0 && (
                  <span className="badge">{totalMyTickets}</span>
                )}
              </li>
              <li
                className={`nav-item ${activeTab === "marketplace" ? "active" : ""}`}
                onClick={() => setActiveTab("marketplace")}
              >
                Marketplace
                {totalMarketListings > 0 && (
                  <span className="badge">{totalMarketListings}</span>
                )}
              </li>
              <li
                className={`nav-item ${activeTab === "createEvent" ? "active" : ""}`}
                onClick={() => setActiveTab("createEvent")}
              >
                Create Event
              </li>
            </ul>
          </nav>
        )}

        {status && (
          <div className={`status-message status-${statusType}`}>
            <span>{status}</span>
          </div>
        )}

        {userAddress ? (
          renderMainContent()
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎫</div>
            <h2 className="empty-state-title">Welcome to NFTickets</h2>
            <p className="empty-state-text">
              Connect your wallet to buy, sell, and manage event tickets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
