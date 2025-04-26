import { ethers } from "ethers";
import EventJSON from "../abis/Event.json";

// Function to upload a file to Pinata
const uploadFileToPinata = async (file) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("File upload failed");
  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
};

// Function to upload JSON to Pinata
const uploadJSONToPinata = async (json) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });

  if (!res.ok) throw new Error("Metadata upload failed");
  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
};

export const buyTicket = async (signer, addr, price, callbacks = {}) => {
  const { onStatus, onSuccess } = callbacks;
  try {
    if (onStatus) onStatus("Buying ticket...", "info");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.buyTicket({ value: ethers.parseEther(price) });
    if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();
    if (onStatus) onStatus("Ticket purchased successfully!", "success");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error buying ticket:", err);
    if (onStatus) onStatus("Failed to buy ticket: " + err.message, "error");
  }
};

export const transferTicket = async (signer, addr, tid, to, callbacks = {}) => {
  const { onStatus, onSuccess } = callbacks;
  try {
    if (onStatus) onStatus("Transferring ticket...", "info");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.transferTicket(to, tid);
    if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();
    if (onStatus) onStatus("Ticket transferred successfully!", "success");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error transferring ticket:", err);
    if (onStatus) onStatus("Failed to transfer ticket: " + err.message, "error");
  }
};

export const listTicket = async (signer, addr, tid, price, expires, callbacks = {}) => {
  const { onStatus, onSuccess } = callbacks;
  try {
    if (onStatus) onStatus("Approving ticket for listing...", "info");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const approvalTx = await ev.approve(addr, tid);
    if (onStatus) onStatus("Approval submitted. Waiting for confirmation...", "info");
    await approvalTx.wait();
    if (onStatus) onStatus("Listing ticket...", "info");
    const tx = await ev.listTicket(tid, ethers.parseEther(price), Number(expires));
    if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();
    if (onStatus) onStatus("Ticket listed successfully!", "success");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error listing ticket:", err);
    if (onStatus) onStatus("Failed to list ticket: " + err.message, "error");
  }
};

export const cancelListing = async (signer, addr, tid, callbacks = {}) => {
  const { onStatus, onSuccess } = callbacks;
  try {
    if (onStatus) onStatus("Canceling listing...", "info");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.cancelListing(tid);
    if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();
    if (onStatus) onStatus("Listing canceled successfully!", "success");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error canceling listing:", err);
    if (onStatus) onStatus("Failed to cancel listing: " + err.message, "error");
  }
};

export const buyListedTicket = async (signer, addr, tid, price, callbacks = {}) => {
  const { onStatus, onSuccess } = callbacks;
  try {
    if (onStatus) onStatus("Buying listed ticket...", "info");
    const ev = new ethers.Contract(addr, EventJSON.abi, signer);
    const tx = await ev.buyListedTicket(tid, { value: ethers.parseEther(price) });
    if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();
    if (onStatus) onStatus("Ticket purchased from marketplace successfully!", "success");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error buying listed ticket:", err);
    if (onStatus) onStatus("Failed to buy listed ticket: " + err.message, "error");
  }
};

export const createEvent = async (factory, eventData, callbacks = {}) => {
  const { onStatus, onSuccess } = callbacks;
  try {
    const { name, description, date, price, max, bannerImage, cardImage, category } = eventData;
    
    // Check if we have images to upload
    if (bannerImage || cardImage) {
      if (onStatus) onStatus("Uploading images to IPFS...", "info");
      
      let bannerImageURI = null;
      let cardImageURI = null;
      
      if (bannerImage) {
        bannerImageURI = await uploadFileToPinata(bannerImage);
      }
      
      if (cardImage) {
        cardImageURI = await uploadFileToPinata(cardImage);
      }
      
      // Create and upload metadata if we have additional fields
      if (description || category || bannerImageURI || cardImageURI) {
        if (onStatus) onStatus("Creating event metadata...", "info");
        
        const metadata = {
          description: description || "",
          category: category || "Other",
          bannerImage: bannerImageURI,
          cardImage: cardImageURI,
          attributes: [
            { trait_type: "Event Date", value: new Date(date * 1000).toISOString() },
            { trait_type: "Ticket Price", value: price },
            { trait_type: "Max Supply", value: max },
            { trait_type: "Category", value: category || "Other" }
          ]
        };
        
        const metadataURI = await uploadJSONToPinata(metadata);
        
        if (onStatus) onStatus("Creating event with metadata...", "info");
        // Call contract with metadata URI
        const tx = await factory.createEvent(
          name,
          Math.floor(date),
          ethers.parseEther(price),
          parseInt(max, 10),
          metadataURI
        );
        
        if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
        await tx.wait();
        if (onStatus) onStatus("Event created successfully with metadata!", "success");
        if (onSuccess) onSuccess();
        return;
      }
    }
    
    // If we don't have images or additional data, use the original function
    if (onStatus) onStatus("Creating event...", "info");
    const tx = await factory.createEvent(
      name,
      Math.floor(date),
      ethers.parseEther(price),
      parseInt(max, 10)
    );
    if (onStatus) onStatus("Transaction submitted. Waiting for confirmation...", "info");
    await tx.wait();
    if (onStatus) onStatus("Event created successfully!", "success");
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error("Error creating event:", err);
    if (onStatus) onStatus("Failed to create event: " + err.message, "error");
  }
};