// src/components/CreateEventForm.jsx
import React, { useState } from "react";
import './CreateEventForm.css';

export default function CreateEventForm({ onCreate }) {
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    date: "", 
    price: "", 
    max: "",
    bannerImage: null,
    cardImage: null,
    category: "Music" // Default category
  });

  // Event categories
  const categories = [
    "Music", 
    "Conference", 
    "Workshop", 
    "Sports", 
    "Arts", 
    "Festival", 
    "Networking", 
    "Food",
    "Charity",
    "Theater",
    "Other"
  ];

  const handleChange = e => {
    const { id, value, files } = e.target;
    if (id === "bannerImage" || id === "cardImage") {
      setForm(f => ({ ...f, [id]: files[0] }));
    } else {
      setForm(f => ({ ...f, [id]: value }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    onCreate({
      name: form.name,
      description: form.description,
      date: new Date(form.date).getTime() / 1000,
      price: form.price,
      max: form.max,
      bannerImage: form.bannerImage,
      cardImage: form.cardImage,
      category: form.category
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

        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <label className="form-label" htmlFor="description">Description</label>
          <textarea 
            className="form-input"
            id="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Provide details about your event"
            rows="4"
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select 
            className="form-input"
            id="category" 
            value={form.category} 
            onChange={handleChange}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
        
        <div className="form-group">
          <label className="form-label" htmlFor="bannerImage">Banner Image</label>
          <input 
            className="form-input"
            id="bannerImage" 
            type="file" 
            accept="image/*" 
            onChange={handleChange}
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="cardImage">Card Image</label>
          <input 
            className="form-input"
            id="cardImage" 
            type="file" 
            accept="image/*" 
            onChange={handleChange}
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