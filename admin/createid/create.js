// --- IMPORTS ---
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.js";
import axios from "https://cdn.jsdelivr.net/npm/axios@1.7.2/+esm";

// --- CONFIGURATION ---
// 🚨 CRITICAL SECURITY WARNING: Your Pinata key is publicly exposed.
// Please go to Pinata, revoke your old key, and create a new one.
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZjM4OTc3OS0yMWIzLTRkYWItYWNhZC0yOTRhMGY0Zjc0YzAiLCJlbWFpbCI6ImhhY2toYWNrYXRob242N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYWQxNDljODBjYzNkYTFhOTQ2YWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiYjUzNDE0MjZmZGU3OWM5MjM0ZDBhMWFhY2NjOTM3NWMwYTFiZjM1YjY3MmUxNWNkYzMxOGU2MzIwMDg4MDBiIiwiZXhwIjoxNzg4MDMzMDA4fQ.jKhwK7R6upvEUB2dLo8HzW-LZtIlOG801IZX87DKUJE';
const CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';
const CONTRACT_ABI = [
    { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getIdentity", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "string", "name": "_cid", "type": "string" }], "name": "setIdentity", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
const COINBASE_APP_ID = '4cd77bf5-76b7-445e-bf24-74deea94b6d1';

// --- STATE ---
let coinbasePay;
let signer;

// --- DOM ELEMENTS ---
const createWalletBtn = document.getElementById('create-wallet-btn');
const skipBtn = document.getElementById('skip-btn');
const initialOptions = document.getElementById('initial-options');
const processingState = document.getElementById('processing-state');
const processingText = document.getElementById('processing-text');

/**
 * Converts a Base64 string back into a Blob.
 */
function base64ToBlob(base64, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
}

async function handleWalletCreation() {
    initialOptions.style.display = 'none';
    processingState.style.display = 'block';

    try {
        // Initialize the SDK and open the wallet pop-up
        initializeCoinbaseSDK();
        coinbasePay.open({ experience: 'embedded' });

    } catch (error) {
        console.error("Wallet creation process failed:", error);
        alert("Could not start the wallet creation process.");
        // Reset UI
        initialOptions.style.display = 'block';
        processingState.style.display = 'none';
    }
}

function initializeCoinbaseSDK() {
    coinbasePay = new window.coinbasePay({
        appId: COINBASE_APP_ID,
        onSuccess: (response) => {
            // This is the callback after a user connects a wallet
            const { provider: coinbaseProvider } = response;
            const ethersProvider = new ethers.providers.Web3Provider(coinbaseProvider);
            signer = ethersProvider.getSigner();
            
            // Now that we have a signer, proceed to upload and store data
            uploadAndStoreData();
        },
        onExit: () => {
            // If user closes the pop-up, reset the UI
            initialOptions.style.display = 'block';
            processingState.style.display = 'none';
        },
        onError: (error) => {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect wallet.");
            initialOptions.style.display = 'block';
            processingState.style.display = 'none';
        }
    });
}

async function uploadAndStoreData() {
    processingText.textContent = 'Uploading data to IPFS...';

    // Retrieve the data from localStorage
    const storedData = localStorage.getItem('refugeeData');
    if (!storedData) {
        alert("Error: No refugee data found. Please go back.");
        return;
    }
    
    const refugeeData = JSON.parse(storedData);
    const photoBlob = base64ToBlob(refugeeData.photo, 'image/jpeg');

    try {
        const cid = await storeOnPinata(refugeeData, photoBlob);
        
        processingText.textContent = 'Storing data on the blockchain...';
        await storeCidOnBlockchain(cid);

        // Clear local storage and redirect to dashboard
        localStorage.removeItem('refugeeData');
        window.location.href = `dashboard.html?cid=${cid}`;

    } catch (error) {
        console.error("Upload/Storage failed:", error);
        alert(`An error occurred: ${error.message}`);
        initialOptions.style.display = 'block';
        processingState.style.display = 'none';
    }
}

async function storeOnPinata(identityData, imageBlob) {
    const data = new FormData();
    data.append('file', imageBlob, 'photo.jpeg');
    data.append('file', new Blob([JSON.stringify(identityData)], { type: 'application/json' }), 'identity.json');
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, { headers: { 'Authorization': `Bearer ${PINATA_JWT}` } });
    return res.data.IpfsHash;
}

async function storeCidOnBlockchain(cid) {
    if (!signer) throw new Error("Wallet not connected.");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.setIdentity(cid);
    await tx.wait();
}

function handleSkip() {
    // If skipping, redirect straight to the dashboard without a CID
    window.location.href = 'dashboard.html';
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the SDK to be ready
    let attempts = 0;
    const interval = setInterval(() => {
        if (window.coinbasePay) {
            clearInterval(interval);
            // Attach event listeners ONLY after SDK is ready
            createWalletBtn.addEventListener('click', handleWalletCreation);
            skipBtn.addEventListener('click', handleSkip);
        } else if (++attempts > 20) {
            clearInterval(interval);
            alert("Could not load wallet components. Please check your internet connection.");
        }
    }, 500);
});
