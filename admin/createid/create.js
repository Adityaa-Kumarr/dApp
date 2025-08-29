// --- IMPORTS ---
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm";

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZjM4OTc3OS0yMWIzLTRkYWItYWNhZC0yOTRhMGY0Zjc0YzAiLCJlbWFpbCI6ImhhY2toYWNrYXRob242N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYWQxNDljODBjYzNkYTFhOTQ2YWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiYjUzNDE0MjZmZGU3OWM5MjM0ZDBhMWFhY2NjOTM3NWMwYTFiZjM1YjY3MmUxNWNkYzMxOGU2MzIwMDg4MDBiIiwiZXhwIjoxNzg4MDMzMDA4fQ.jKhwK7R6upvEUB2dLo8HzW-LZtIlOG801IZX87DKUJE';
const CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';
const CONTRACT_ABI = [
    { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getIdentity", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "_cid", "type": "string" }], "name": "setIdentity", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
const COINBASE_APP_ID = 'd1a2b1fb-a597-4fd9-87db-0b4993b4bec3';


// --- STATE MANAGEMENT ---
let provider;
let signer;
let capturedImageBlob = null;
let coinbasePay = null;


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


// --- FUNCTIONS ---

// 1. Wallet Connection
function initializeCoinbaseSDK() {
    if (window.coinbasePay) {
        coinbasePay = new window.coinbasePay({
            appId: COINBASE_APP_ID,
            onSuccess: (response) => {
                const { address, provider: coinbaseProvider } = response;
                provider = new ethers.providers.Web3Provider(coinbaseProvider);
                signer = provider.getSigner();
                connectWalletBtn.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                submitBtn.disabled = false;
                console.log("Embedded wallet connected:", address);
            },
            onExit: () => console.log("User exited the wallet connection flow."),
            onError: (error) => {
                console.error("Failed to connect wallet:", error);
                alert("Failed to connect wallet.");
            }
        });
    } else {
        // This should not happen with the new check, but is good for debugging
        console.error('Coinbase Pay SDK not found.');
    }
}

async function connectWallet() {
    if (!coinbasePay) {
        alert('Coinbase SDK not initialized.');
        return;
    }
    coinbasePay.open({ experience: 'embedded' });
}

// 2. Camera Logic (No changes)
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

// 3. Pinata IPFS Upload Logic (No changes)
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

// 4. Smart Contract Interaction (No changes)
async function storeCidOnBlockchain(cid) {
    if (!signer) throw new Error("Wallet not connected.");
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.setIdentity(cid);
        await tx.wait();
        console.log("Transaction confirmed! CID stored on the blockchain.");
    } catch (error) {
        console.error("Blockchain transaction failed:", error);
        throw new Error("Could not store CID on the blockchain.");
    }
}

// 5. Form Submission Handler (No changes)
async function handleFormSubmit(event) {
    event.preventDefault();
    if (!capturedImageBlob) {
        alert("Please capture a photo first.");
        return;
    }
    showModal('processing', 'Processing...', 'Please wait while we create the ID and store it securely.');
    try {
        const formData = new FormData(form);
        const cid = await storeOnPinata(formData, imageBlob);
        await storeCidOnBlockchain(cid);
        showModal('success', 'ID Created Successfully!', `Your secure identity has been stored. IPFS CID: ${cid}`);
        form.reset();
        recapturePhoto();
    } catch (error) {
        console.error("ID creation failed:", error);
        showModal('error', 'Creation Failed', error.message);
    }
}

// 6. Modal UI Helper (No changes)
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
// NEW: This function contains all the setup logic.
function initializeApp() {
    initializeCoinbaseSDK();
    startCamera();
    
    // Attach event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    captureBtn.addEventListener('click', takePicture);
    recaptureBtn.addEventListener('click', recapturePhoto);
    form.addEventListener('submit', handleFormSubmit);
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// NEW: This function waits for the Coinbase SDK to be loaded before starting the app.
function waitForSDK() {
    let attempts = 0;
    const maxAttempts = 20; // Try for 10 seconds

    const interval = setInterval(() => {
        // Check if the SDK is available on the window object
        if (window.coinbasePay) {
            clearInterval(interval);
            initializeApp(); // Start the app
        } else {
            attempts++;
            if (attempts > maxAttempts) {
                clearInterval(interval);
                console.error("Failed to load Coinbase SDK after 10 seconds.");
                alert("Could not load wallet components. Please check your internet connection and refresh the page.");
            }
        }
    }, 500); // Check every 500ms
}

// Start the process when the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    waitForSDK();
});

