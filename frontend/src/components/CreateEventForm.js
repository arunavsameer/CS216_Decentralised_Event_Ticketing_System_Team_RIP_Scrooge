import React, { useState } from "react";
import { getFactoryWithSigner, toWei } from "../utils/ethers";

function CreateEventForm({ onEventCreated }) {
  const [name, setName]       = useState("");
  const [price, setPrice]     = useState("0.05");
  const [supply, setSupply]   = useState("100");
  const [date, setDate]       = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !price || !supply || !date) {
      alert("Please fill in all fields.");
      return;
    }
    setCreating(true);
    try {
      const factory   = await getFactoryWithSigner();
      const timestamp = Math.floor(new Date(date).getTime() / 1000);
      const tx = await factory.createEvent(
        name,
        timestamp,
        toWei(price),
        parseInt(supply, 10)
      );
      await tx.wait();
      alert("🎉 Event created successfully!");
      onEventCreated && onEventCreated();
    } catch (err) {
      console.error("Create event failed:", err);
      alert("❌ Failed to create event. See console.");
    }
    setCreating(false);
  };

  return (
    <div style={{ marginBottom: 32, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>➕ Create New Event</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Name:</label><br/>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Ticket Price (ETH):</label><br/>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Max Supply:</label><br/>
        <input type="number" value={supply} onChange={e => setSupply(e.target.value)} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Event Date:</label><br/>
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <button onClick={handleCreate} disabled={creating}>
        {creating ? "Creating…" : "Create Event"}
      </button>
    </div>
  );
}

export default CreateEventForm;