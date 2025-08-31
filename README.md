# 🔐SafeID: Decentralized Identity for Displaced Civilians 🌍

**Team Nexaid** - *Innovate-A-Thon 3.0*

**Team Members:**
- **Aditya Kumar** (Team Leader)
- **Zeba Praween** (Team Member)
- **Samiksha Raj** (Team Member)

---

**SafeID** is a Web3-based decentralized application (dApp) designed to provide a secure, portable, and tamper-proof digital identity for displaced civilians in crisis situations.  
It ensures that individuals who have lost their documents can still access humanitarian aid, cross borders, and restore their legal rights.

---

## 🚨 The Problem

During crises such as conflicts, natural disasters, or mass displacement, civilians often lose access to critical identification documents. Without proof of identity, they face immense challenges in:

- Accessing essential services  
- Crossing borders legally  
- Reuniting with their families  

Traditional identity systems are often:

- Slow  
- Centralized  
- Vulnerable to loss or tampering  

✅ **SafeID solves this by leveraging decentralized technologies** to create a resilient, tamper-proof, and user-controlled identity system.

---

## ⚙️ How It Works

-- Deployed Link
- https://teamnexaid.netlify.app/

SafeID follows a **two-step process** managed entirely by aid workers through a simple web interface. Refugees do not need technical knowledge.

### 1. Identity Creation & Biometric Registration
- An aid worker enters refugee details (name, nationality, etc.) and captures a photo.  
- Using the **Web Authentication API (WebAuthn)**, the system captures a biometric credential (e.g., fingerprint).  
- A cryptographic key pair is generated at the device level.  
- The identity package (details, photo, and biometric key) is uploaded to **IPFS via Pinata**, producing a permanent **Content ID (CID)**.  

### 2. Document & Wallet Management
- The aid worker uploads supporting documents (passports, certificates, etc.).  
- Each document is stored on **IPFS**, named with a unique identifier (wallet address or generated ID).  
- The **IPFS CID** serves as a globally verifiable pointer to the refugee's identity and documents.  

---

## ✨ Key Features

- **Decentralized Storage** – Refugee data stored on IPFS, censorship-resistant and tamper-proof.  
- **Biometric Security** – Uses WebAuthn API for fingerprint/biometric authentication.  
- **User-Centric Design** – Refugees don't need technical knowledge; aid workers handle everything.  
- **Optional Wallet Integration** – Can link a crypto wallet but is not required.  
- **Verifiable & Portable** – IPFS CIDs act as permanent proof of identity, usable worldwide.  

---

## 🏗️ Architecture

The SafeID system is designed with a **decentralized architecture**, ensuring that data is secure and not reliant on a single point of failure.  

The flow is managed through a frontend application that interacts with Web3 services.

- **Frontend (Aid Worker UI):** A web application built with HTML, CSS, and Vanilla JavaScript serves as the interface for aid workers.  
- **Biometric Authentication:** The frontend uses the WebAuthn API to interact with the device's hardware (like a fingerprint scanner) to create a secure cryptographic credential.  
- **Decentralized Storage (IPFS):** All data (refugee details, photos, documents) is uploaded to the IPFS network via the Pinata API. This returns a unique CID for each record.  
- **Blockchain (Future Scope):** The IPFS CID can be linked to the refugee's wallet address and stored on a smart contract (e.g., on a low-cost L2 like Base or Polygon) to create an immutable, on-chain record.  

---

## 💻 Tech Stack

This project utilizes a modern, lightweight tech stack designed for rapid development and secure, decentralized functionality.

| **Category**          | **Technology** |
|------------------------|----------------|
| Frontend              | HTML5, CSS3, Vanilla JavaScript (ESM) |
| Blockchain & Wallet   | Ethers.js, Coinbase Wallet SDK (Embedded Wallet), Solidity (Smart Contract) |
| Decentralized Storage | IPFS |
| IPFS Pinning Service  | Pinata API |
| Biometric Security    | Web Authentication API (WebAuthn) |
| Development Tools     | VS Code, Live Server |

---

## 🛠️ Installation and Local Setup

### ✅ Prerequisites
- Node.js installed  
- Visual Studio Code  
- Live Server extension for VS Code  

### ⚡ Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Adityaa-Kumarr/dApp.git
   cd dApp
   ```

2. **Configure Live Server for HTTPS**
   - In VS Code, go to Settings.
   - Search for Live Server HTTPS and check the box to enable it.
   - (This is required for the camera and fingerprint scanner to work).

3. **Get a Pinata API Key**
   - Create a free account at Pinata.
   - Go to the API Keys section and create a new key with Admin permissions.
   - Copy the JWT (it's a very long string that starts with eyJ...).

4. **Update Configuration**
   - Open the file: `admin/createid/createid.html`.
   - Find the `PINATA_JWT` constant in the `<script>` section.
   - Paste your new key inside the quotes.

5. **Run the Application**
   - Right-click on `admin/admin.html` in the VS Code explorer.
   - Select "Open with Live Server".
   - Your browser will open to the admin login page.
   - Use the credentials:
     - Username: `admin`
     - Password: `123`

✅ You can now use the application to create and manage refugee identities.

---

## 📸 Screenshot

<img width="1434" height="725" alt="image" src="https://github.com/user-attachments/assets/b0b44b3b-5407-456a-8f02-081cedb0b4a5" />

---

## 2️⃣ Future Improvements

- **Blockchain Integration**: Store CIDs on-chain using Polygon/Base for tamper-proof audit trails.
- **Offline Support**: Enable data capture in areas without internet, with later syncing.
- **Multi-Language Support**: Localized UI for aid workers in different regions.
- **Zero-Knowledge Proofs**: Enable privacy-preserving identity verification.
- **AI-Powered Verification**: Use AI to detect document forgery or mismatched identities.

---

## 4️⃣ Project Structure

```
dApp/
│── admin/
│   ├── admin.html          # Admin dashboard
│   ├── createid/
│   │   └── createid.html   # Refugee identity creation page
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   └── assets/             # Images & icons
│
├── index.html              # Landing page
├── README.md               # Project documentation
└── package.json            # Dependencies & metadata
```

---

## 5️⃣ Embedded AI Chatbot 🤖

SafeID includes an AI-powered chatbot that provides:

- **24/7 Support** for aid workers.
- **Guided Walkthroughs** for identity creation.
- **Troubleshooting** for errors in biometric authentication, uploads, or wallet integration.
- **Multilingual Conversations** to break language barriers.

The chatbot is integrated into the admin dashboard to ensure smooth operations, even for non-technical staff.
