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
  
  const [errors, setErrors] = useState({
    date: "",
    bannerImage: "",
    cardImage: ""
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

  const validateImageSize = (file) => {
    if (!file) return true;
    
    // Check if file size is less than 5MB (5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    return file.size <= maxSize;
  };

  const validateDate = (dateString) => {
    if (!dateString) return false;
    
    const selectedDate = new Date(dateString);
    const currentDate = new Date();
    
    // Check if selected date is in the future
    return selectedDate > currentDate;
  };

  const handleChange = e => {
    const { id, value, files } = e.target;
    
    if (id === "bannerImage" || id === "cardImage") {
      // Reset error for this field
      setErrors(prev => ({ ...prev, [id]: "" }));
      
      // If file is selected, validate its size
      if (files.length > 0) {
        const file = files[0];
        if (!validateImageSize(file)) {
          setErrors(prev => ({ ...prev, [id]: "Image must be less than 5MB" }));
          return;
        }
        setForm(f => ({ ...f, [id]: file }));
      } else {
        setForm(f => ({ ...f, [id]: null }));
      }
    } else if (id === "date") {
      setErrors(prev => ({ ...prev, date: "" }));
      if (!validateDate(value)) {
        setErrors(prev => ({ ...prev, date: "Event date must be in the future" }));
      }
      setForm(f => ({ ...f, [id]: value }));
    } else {
      setForm(f => ({ ...f, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate date
    if (!validateDate(form.date)) {
      setErrors(prev => ({ ...prev, date: "Event date must be in the future" }));
      return;
    }
    
    // Final validation check before submission
    const bannerImageValid = validateImageSize(form.bannerImage);
    const cardImageValid = validateImageSize(form.cardImage);
    
    if (!bannerImageValid || !cardImageValid) {
      setErrors(prev => ({
        ...prev,
        bannerImage: !bannerImageValid ? "Banner image must be less than 5MB" : "",
        cardImage: !cardImageValid ? "Card image must be less than 5MB" : ""
      }));
      return;
    }
    
    // Create a copy of the form data to modify
    const formData = { ...form };
    
    // If no banner image is selected, use the default banner
    if (!formData.bannerImage) {
      try {
        const response = await fetch('/high_res_banner.jpg');
        const blob = await response.blob();
        formData.bannerImage = new File([blob], 'high_res_banner.jpg', { type: 'image/jpeg' });
      } catch (error) {
        console.error("Error loading default banner image:", error);
      }
    }
    
    onCreate({
      name: formData.name,
      description: formData.description,
      date: new Date(formData.date).getTime() / 1000,
      price: formData.price,
      max: formData.max,
      bannerImage: formData.bannerImage,
      cardImage: formData.cardImage,
      category: formData.category
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
            className={`form-input ${errors.date ? 'input-error' : ''}`}
            id="date" 
            type="datetime-local" 
            value={form.date} 
            onChange={handleChange} 
            required 
          />
          {errors.date && <p className="error-message">{errors.date}</p>}
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
          <label className="form-label" htmlFor="bannerImage">Banner Image (optional, default will be used if not provided)</label>
          <input 
            className={`form-input ${errors.bannerImage ? 'input-error' : ''}`}
            id="bannerImage" 
            type="file" 
            accept="image/*" 
            onChange={handleChange}
          />
          {errors.bannerImage && <p className="error-message">{errors.bannerImage}</p>}
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="cardImage">Card Image (optional, max 5MB)</label>
          <input 
            className={`form-input ${errors.cardImage ? 'input-error' : ''}`}
            id="cardImage" 
            type="file" 
            accept="image/*" 
            onChange={handleChange}
          />
          {errors.cardImage && <p className="error-message">{errors.cardImage}</p>}
        </div>
        
        <div className="form-group" style={{ gridColumn: '1/-1' }}>
          <button className="form-submit" type="submit">Create Event</button>
        </div>
      </form>
    </>
  );
}