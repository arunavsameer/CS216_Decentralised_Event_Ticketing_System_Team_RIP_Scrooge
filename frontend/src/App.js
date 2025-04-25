import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import ConnectWalletButton from "./components/ConnectWalletButton";
import CreateEventForm from "./components/CreateEventForm";
import EventList from "./components/EventList";

import FactoryJSON from "./abis/EventFactory.json";
import EventJSON from "./abis/Event.json";

import "./App.css";

function App() {
  const [userAddress, setUserAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factory, setFactory] = useState(null);
  const [eventDetails, setEventDetails] = useState([]);
  const [status, setStatus] = useState("");

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const s = await provider.getSigner();
    setSigner(s);
    setUserAddress(await s.getAddress());

    const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS;
    setFactory(new ethers.Contract(factoryAddress, FactoryJSON.abi, s));
    setStatus("Wallet connected");
  };

  // Load all event data
  const loadEventDetails = useCallback(async () => {
    if (!factory || !signer) return;

    try {
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
              const l = await ev.listings(tid);
              return {
                ticketId: tid,
                seller: l.seller,
                price: ethers.formatEther(l.price),
                expiresAt: new Date(Number(l.expiresAt) * 1000).toLocaleString(),
              };
            })
          );

          const marketplaceListings = [];
          for (let tid = 1; tid <= Number(sold); tid++) {
            const l = await ev.listings(tid);
            if (l.seller && l.seller !== ethers.ZeroAddress) {
              marketplaceListings.push({
                ticketId: tid,
                seller: l.seller,
                price: ethers.formatEther(l.price),
                expiresAt: new Date(Number(l.expiresAt) * 1000).toLocaleString(),
              });
            }
          }

          return {
            address: addr,
            name,
            date: new Date(Number(date) * 1000).toLocaleString(),
            price: ethers.formatEther(price),
            maxSupply: Number(maxSupply),
            sold: Number(sold),
            myTickets,
            listings: myListings, // for EventList compatibility
            myListings,
            marketplaceListings,
          };
        })
      );

      setEventDetails(details);
    } catch (err) {
      console.error("Error loading event details:", err);
    }
  }, [factory, signer]);

  useEffect(() => {
    if (factory && signer) {
      loadEventDetails();
    }
  }, [factory, signer, loadEventDetails]);

  // Handlers
  const createEvent = async ({ name, date, price, max }) => {
    setStatus("Creating event...");
    const tx = await factory.createEvent(
      name,
      Math.floor(date),
      ethers.parseEther(price),
      parseInt(max, 10)
    );
    await tx.wait();
    setStatus("Event created");
    loadEventDetails();
  };

  const buyTicket = async (addr, price) => {
    setStatus("Buying ticket...");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.buyTicket({ value: ethers.parseEther(price) });
    await tx.wait();
    setStatus("Ticket bought");
    loadEventDetails();
  };

  const transferTicket = async (addr, tid, to) => {
    setStatus("Transferring ticket...");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.transferTicket(to, tid);
    await tx.wait();
    setStatus("Ticket transferred");
    loadEventDetails();
  };

  const listTicket = async (addr, tid, price, expires) => {
    setStatus("Approving ticket for listing...");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);

    const approvalTx = await ev.approve(addr, tid);
    await approvalTx.wait();

    setStatus("Listing ticket...");
    const tx = await ev.listTicket(tid, ethers.parseEther(price), Number(expires));
    await tx.wait();

    setStatus("Ticket listed");
    loadEventDetails();
  };

  const cancelListing = async (addr, tid) => {
    setStatus("Canceling listing...");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.cancelListing(tid);
    await tx.wait();
    setStatus("Listing canceled");
    loadEventDetails();
  };

  const buyListedTicket = async (addr, tid, price) => {
    setStatus("Buying listed ticket...");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.buyListedTicket(tid, { value: ethers.parseEther(price) });
    await tx.wait();
    setStatus("Ticket purchased from marketplace");
    loadEventDetails();
  };

  return (
    <div className="container">
      <h1>🎫 Event Ticketing DApp</h1>

      {!userAddress ? (
        <ConnectWalletButton onConnect={connectWallet} />
      ) : (
        <>
          <p>Connected: {userAddress}</p>

          <CreateEventForm onCreate={createEvent} status={status} />

          <EventList
            events={eventDetails}
            currentAddress={userAddress}
            onBuyTicket={buyTicket}
            onTransfer={transferTicket}
            onList={listTicket}
            onCancel={cancelListing}
            onBuyListing={buyListedTicket}
          />

          {/* ─── MARKETPLACE SECTION ─────────────────────────── */}
          <section className="marketplace">
            <h2>🛒 Marketplace</h2>
            {eventDetails.some(ev => ev.marketplaceListings.length > 0) ? (
              eventDetails.map(ev =>
                ev.marketplaceListings.length > 0 && (
                  <div key={ev.address} className="marketplace-event">
                    <h3>{ev.name}</h3>
                    {ev.marketplaceListings.map((listing) => (
                      <div key={listing.ticketId} className="listing-card">
                        <p><strong>Ticket #{listing.ticketId}</strong></p>
                        <p>Price: {listing.price} ETH</p>
                        <p>Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
                        <p>Expires: {listing.expiresAt}</p>

                        {listing.seller.toLowerCase() === userAddress.toLowerCase() ? (
                          <button onClick={() => cancelListing(ev.address, listing.ticketId)}>
                            Cancel Listing
                          </button>
                        ) : (
                          <button onClick={() => buyListedTicket(ev.address, listing.ticketId, listing.price)}>
                            Buy Ticket
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )
            ) : (
              <p>No tickets currently listed on the marketplace.</p>
            )}
          </section>

          <p className="status">{status}</p>
        </>
      )}
    </div>
  );
}

export default App;
