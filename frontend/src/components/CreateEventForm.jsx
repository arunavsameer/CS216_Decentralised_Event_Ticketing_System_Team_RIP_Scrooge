// src/components/CreateEventForm.jsx
import React, { useState } from "react";
import './CreateEventForm.css';

export default function CreateEventForm({ onCreate }) {
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
    <>
      <h2 className="section-title">Create New Event</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Event Name</label>
          <input 
            className="form-input"
            id="name" 
            type="text" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Concert, Conference, etc."
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">Date & Time</label>
          <input 
            className="form-input"
            id="date" 
            type="datetime-local" 
            value={form.date} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="price">Price (ETH)</label>
          <input 
            className="form-input"
            id="price" 
            type="number" 
            step="0.001" 
            value={form.price} 
            onChange={handleChange} 
            placeholder="0.05"
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="max">Max Tickets</label>
          <input 
            className="form-input"
            id="max" 
            type="number" 
            min="1" 
            value={form.max} 
            onChange={handleChange}
            placeholder="100" 
            required 
          />
        </div>
        
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <button className="form-submit" type="submit">Create Event</button>
        </div>
      </form>
    </>
  );
}