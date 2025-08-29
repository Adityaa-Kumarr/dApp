// --- CONFIGURATION ---
// 🚨 IMPORTANT: You have publicly shared your key. 
// Please REVOKE this key on Pinata and create a new one.
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZjM4OTc3OS0yMWIzLTRkYWItYWNhZC0yOTRhMGY0Zjc0YzAiLCJlbWFpbCI6ImhhY2toYWNrYXRob242N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYWQxNDljODBjYzNkYTFhOTQ2YWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiYjUzNDE0MjZmZGU3OWM5MjM0ZDBhMWFhY2NjOTM3NWMwYTFiZjM1YjY3MmUxNWNkYzMxOGU2MzIwMDg4MDBiIiwiZXhwIjoxNzg4MDMzMDA4fQ.jKhwK7R6upvEUB2dLo8HzW-LZtIlOG801IZX87DKUJE'; 
const CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';
const CONTRACT_ABI = [
	{ "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }], "name": "getIdentity", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
	{ "inputs": [{ "internalType": "string", "name": "_cid", "type": "string" }], "name": "setIdentity", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

// --- STATE MANAGEMENT ---
let provider;
let signer;
let capturedImageBlob = null;

// --- DOM ELEMENT REFERENCES ---
let connectWalletBtn, form, submitBtn, video, canvas, captureBtn, photoPreview, modal, modalSpinner, modalIcon, modalTitle, modalText, closeModalBtn, recaptureBtn; // <-- Added recaptureBtn

function initializeDOMElements() {
    connectWalletBtn = document.getElementById('connect-wallet-btn');
    form = document.getElementById('create-id-form');
    submitBtn = document.getElementById('submit-btn');
    video = document.getElementById('camera-stream');
    canvas = document.getElementById('photo-canvas');
    captureBtn = document.getElementById('capture-btn');
    photoPreview = document.getElementById('photo-preview');
    modal = document.getElementById('fingerprint-modal');
    modalSpinner = document.getElementById('modal-spinner');
    modalIcon = document.getElementById('modal-icon');
    modalTitle = document.getElementById('modal-title');
    modalText = document.getElementById('modal-text');
    closeModalBtn = document.getElementById('close-modal-btn');
    recaptureBtn = document.getElementById('recapture-btn'); // <-- Get the new button
}

// --- FUNCTIONS ---

// 1. Wallet Connection
async function connectWallet() {
    // ... (no changes in this function)
    if (typeof window.ethereum === 'undefined') {
        alert('Please install Coinbase Wallet or MetaMask!');
        return;
    }
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        
        connectWalletBtn.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        submitBtn.disabled = false;
        console.log("Wallet connected:", address);
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet.");
    }
}

// 2. Camera Logic
async function startCamera() {
    // ... (no changes in this function)
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

    // ---- NEW: Show/hide the correct buttons ----
    captureBtn.style.display = 'none';
    recaptureBtn.style.display = 'inline-block';

    canvas.toBlob(blob => {
        capturedImageBlob = blob;
    }, 'image/jpeg');
}

// ---- NEW: Recapture Function ----
function recapturePhoto() {
    // Show the video stream and hide the preview
    video.style.display = 'block';
    photoPreview.style.display = 'none';

    // Show the original capture button and hide the recapture button
    captureBtn.style.display = 'inline-block';
    recaptureBtn.style.display = 'none';

    // Clear the stored image blob
    capturedImageBlob = null;
}

// 3. Pinata IPFS Upload Logic
async function storeOnPinata(formData, imageBlob) {
    // ... (no changes in this function)
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

// 4. Smart Contract Interaction
async function storeCidOnBlockchain(cid) {
    // ... (no changes in this function)
    if (!signer) throw new Error("Wallet not connected.");
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        console.log("Sending transaction to store CID on blockchain...");
        const tx = await contract.setIdentity(cid);
        console.log("Transaction sent. Waiting for confirmation...", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed! CID stored on the blockchain.");
    } catch (error) {
        console.error("Blockchain transaction failed:", error);
        throw new Error("Could not store CID on the blockchain.");
    }
}

// 5. Form Submission Handler
async function handleFormSubmit(event) {
    // ... (no changes in this function)
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
        showModal('success', 'ID Created Successfully!', `Your secure identity has been stored. IPFS CID: ${cid}`);
        form.reset();
        recapturePhoto(); // Use the new recapture function to reset the UI
    } catch (error) {
        console.error("ID creation failed:", error);
        showModal('error', 'Creation Failed', error.message);
    }
}

// 6. Modal UI Helper
function showModal(type, title, text) {
    // ... (no changes in this function)
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
    initializeDOMElements();
    startCamera();
    
    // Attach event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    captureBtn.addEventListener('click', takePicture);
    recaptureBtn.addEventListener('click', recapturePhoto); // <-- Attach listener for the new button
    form.addEventListener('submit', handleFormSubmit);
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});