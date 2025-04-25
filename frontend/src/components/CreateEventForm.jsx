// src/components/CreateEventForm.jsx
import React, { useState } from "react";

export default function CreateEventForm({ onCreate, status }) {
  const [form, setForm] = useState({ name: "", date: "", price: "", max: "" });

  const handleChange = e => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onCreate({
      name: form.name,
      date: new Date(form.date).getTime() / 1000,
      price: form.price,
      max: form.max
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
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
      <p className="status">{status}</p>
    </form>
  );
}
