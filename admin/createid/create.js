// --- IMPORTS ---
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm";

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZjM4OTc3OS0yMWIzLTRkYWItYWNhZC0yOTRhMGY0Zjc0YzAiLCJlbWFpbCI6ImhhY2toYWNrYXRob242N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYWQxNDljODBjYzNkYTFhOTQ2YWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiYjUzNDE0MjZmZGU3OWM5MjM0ZDBhMWFhY2NjOTM3NWMwYTFiZjM1YjY3MmUxNWNkYzMxOGU2MzIwMDg4MDBiIiwiZXhwIjoxNzg4MDMzMDA4fQ.jKhwK7R6upvEUB2dLo8HzW-LZtIlOG801IZX87DKUJE';
const CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';
const CONTRACT_ABI = [
    { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getIdentity", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "_cid", "type": "string" }], "name": "setIdentity", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

// --- STATE MANAGEMENT ---
let capturedImageBlob = null;
let walletAddress = null;

// --- DOM ELEMENT REFERENCES ---
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const form = document.getElementById('create-id-form');
const submitBtn = document.getElementById('submit-btn');
const video = document.getElementById('camera-stream');
const canvas = document.getElementById('photo-canvas');
const captureBtn = document.getElementById('capture-btn');
const photoPreview = document.getElementById('photo-preview');
const modal = document.getElementById('fingerprint-modal');
const modalSpinner = document.getElementById('modal-spinner');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const closeModalBtn = document.getElementById('close-modal-btn');
const recaptureBtn = document.getElementById('recapture-btn');
const walletInfoDiv = document.getElementById('wallet-info');
const walletAddressSpan = document.getElementById('wallet-address');

// --- FUNCTIONS ---

/**
 * Redirects the user to the dedicated sign-in page.
 * It passes the current page's URL so the sign-in page knows where to return.
 */
function redirectToSignIn() {
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `../../../cdp-app/index.html?returnUrl=${returnUrl}`;
}

/**
 * Checks the URL for a 'walletAddress' parameter upon page load.
 * If found, it updates the UI to show the connected state.
 */
function checkForWalletAddress() {
    const params = new URLSearchParams(window.location.search);
    walletAddress = params.get('walletAddress');

    if (walletAddress) {
        console.log("Wallet address received:", walletAddress);
        // Display the address and enable the form
        walletAddressSpan.textContent = walletAddress;
        walletInfoDiv.style.display = 'block';
        connectWalletBtn.style.display = 'none'; // Hide the connect button
        submitBtn.disabled = false;
    } else {
        // If no wallet address, ensure the connect button is visible
        connectWalletBtn.style.display = 'block';
        walletInfoDiv.style.display = 'none';
    }
}

/**
 * NOTE: This is a SIMULATED blockchain transaction.
 * Because we used a redirect flow, this page doesn't have the 'signer' object needed
 * to create a real transaction. For a hackathon, this simulation is a practical approach.
 */
async function storeCidOnBlockchain(cid) {
    if (!walletAddress) throw new Error("Wallet not connected.");
    console.log(`SIMULATING: Storing CID ${cid} for address ${walletAddress} on the blockchain.`);
    // We wait for 1.5 seconds to mimic the time a real transaction would take.
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Transaction simulation complete.");
}

/**
 * Handles the main form submission process.
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    if (!capturedImageBlob) {
        alert("Please capture a photo first.");
        return;
    }
    showModal('processing', 'Processing...', 'Please wait while we create the ID and store it securely.');
    try {
        const formData = new FormData(form);
        const cid = await storeOnPinata(formData, capturedImageBlob);
        await storeCidOnBlockchain(cid);
        
        // On success, redirect to the dashboard and pass the CID
        window.location.href = `dashboard.html?cid=${cid}`;
        
    } catch (error) {
        console.error("ID creation failed:", error);
        showModal('error', 'Creation Failed', error.message);
    }
}


// --- Camera, Modal, and Pinata functions ---

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please grant permission.");
    }
}

function takePicture() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    photoPreview.src = canvas.toDataURL('image/jpeg');
    photoPreview.style.display = 'block';
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    recaptureBtn.style.display = 'inline-block';
    canvas.toBlob(blob => { capturedImageBlob = blob; }, 'image/jpeg');
}

function recapturePhoto() {
    video.style.display = 'block';
    photoPreview.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    recaptureBtn.style.display = 'none';
    capturedImageBlob = null;
}

async function storeOnPinata(formData, imageBlob) {
    if (!imageBlob) throw new Error("No image captured to upload.");
    const identityData = { name: formData.get('name'), phone: formData.get('phone'), email: formData.get('email'), nationality: formData.get('nationality'), createdAt: new Date().toISOString() };
    const data = new FormData();
    data.append('file', imageBlob, 'photo.jpeg');
    data.append('file', new Blob([JSON.stringify(identityData)], { type: 'application/json' }), 'identity.json');
    console.log("Uploading files to IPFS via Pinata...");
    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, { headers: { 'Authorization': `Bearer ${PINATA_JWT}` } });
        const cid = res.data.IpfsHash;
        console.log("Successfully stored on Pinata. CID:", cid);
        return cid;
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
        throw new Error("Failed to upload files to IPFS.");
    }
}

function showModal(type, title, text) {
    modal.style.display = 'flex';
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalSpinner.style.display = type === 'processing' ? 'block' : 'none';
    modalIcon.style.display = type !== 'processing' ? 'block' : 'none';
    closeModalBtn.style.display = type !== 'processing' ? 'block' : 'none';
    modalIcon.className = 'fas';
    if (type === 'success') modalIcon.classList.add('fa-check-circle');
    else if (type === 'error') modalIcon.classList.add('fa-times-circle');
    else modalIcon.classList.add('fa-fingerprint');
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkForWalletAddress();
    startCamera();
    
    connectWalletBtn.addEventListener('click', redirectToSignIn);
    captureBtn.addEventListener('click', takePicture);
    recaptureBtn.addEventListener('click', recapturePhoto);
    form.addEventListener('submit', handleFormSubmit);
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

