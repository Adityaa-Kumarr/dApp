# SafeID: Decentralized Identity for Displaced Civilians 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![IPFS](https://img.shields.io/badge/Storage-IPFS-orange)](https://ipfs.tech/)
[![WebAuthn](https://img.shields.io/badge/Security-WebAuthn-green)](https://www.w3.org/TR/webauthn/)
[![Pinata](https://img.shields.io/badge/Pinata-API-yellow)](https://www.pinata.cloud/)  

SafeID is a **Web3-based decentralized application (dApp)** designed to provide a secure, portable, and tamper-proof digital identity for displaced civilians in crisis situations.  
It ensures that individuals who have lost their documents can still **access humanitarian aid, cross borders, and restore their legal rights**.

---

## 🚨 The Problem
During crises such as **conflicts, natural disasters, or mass displacement**, civilians often lose access to critical identification documents. Without proof of identity, they face immense challenges in:
- Accessing essential services  
- Crossing borders legally  
- Reuniting with their families  

Traditional identity systems are often:
- Slow  
- Centralized  
- Vulnerable to loss or tampering  

✅ **SafeID solves this by leveraging decentralized technologies** to create a **resilient, tamper-proof, and user-controlled identity system.**

---

## ⚙️ How It Works
SafeID follows a **two-step process** managed entirely by **aid workers** through a simple web interface. Refugees do not need technical knowledge.

### 1. Identity Creation & Biometric Registration
- Aid worker enters refugee details (name, nationality, etc.) and captures a photo.  
- Using **Web Authentication API (WebAuthn)**, the system captures a biometric credential (e.g., fingerprint).  
- A **cryptographic key pair** is generated at the device level.  
- The identity package (**details, photo, and biometric key**) is uploaded to **IPFS** via **Pinata**, producing a **permanent Content ID (CID)**.  

### 2. Document & Wallet Management
- Aid worker uploads supporting documents (passports, certificates, etc.).  
- Each document is stored on **IPFS**, named with a **unique identifier** (wallet address or generated ID).  
- The **IPFS CID** serves as a globally verifiable pointer to the refugee’s identity and documents.  

---

## ✨ Key Features
- **Decentralized Storage** – Refugee data stored on **IPFS**, censorship-resistant and tamper-proof.  
- **Biometric Security** – Uses **WebAuthn API** for fingerprint/biometric authentication.  
- **User-Centric Design** – Refugees don’t need technical knowledge; aid workers handle everything.  
- **Optional Wallet Integration** – Can link a crypto wallet but is not required.  
- **Verifiable & Portable** – IPFS CIDs act as permanent proof of identity, usable worldwide.  

---

## 🛠️ Installation and Local Setup

### ✅ Prerequisites
- [Node.js](https://nodejs.org/) installed  
- [Visual Studio Code](https://code.visualstudio.com/)  
- **Live Server** extension for VS Code  

---

### ⚡ Setup Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/Adityaa-Kumarr/dApp.git
   cd dApp

##  Screenshot
<img width="1434" height="725" alt="image" src="https://github.com/user-attachments/assets/b0b44b3b-5407-456a-8f02-081cedb0b4a5" />
