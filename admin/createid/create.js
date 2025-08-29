// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Get the form and modal elements
    const form = document.getElementById('create-id-form');
    const modal = document.getElementById('fingerprint-modal');

    // Add an event listener for the form submission
    form.addEventListener('submit', (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Check if the form is valid (basic check)
        if (form.checkValidity()) {
            // Show the fingerprint modal
            modal.style.display = 'flex';

            // Set a timeout to redirect to the upload page after a few seconds
            setTimeout(() => {
                window.location.href = './admin/upload/upload.html';
            }, 3000); // Redirect after 3 seconds
        } else {
            // If form is invalid, trigger browser's validation messages
            form.reportValidity();
        }
    });
});

// --- CONFIGURATION ---
// 1. REVOKE your old key and create a new one on Pinata.
// 2. Choose "JWT" and copy the token that starts with "eyJ...".
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZjM4OTc3OS0yMWIzLTRkYWItYWNhZC0yOTRhMGY0Zjc0YzAiLCJlbWFpbCI6ImhhY2toYWNrYXRob242N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYWQxNDljODBjYzNkYTFhOTQ2YWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiYjUzNDE0MjZmZGU3OWM5MjM0ZDBhMWFhY2NjOTM3NWMwYTFiZjM1YjY3MmUxNWNkYzMxOGU2MzIwMDg4MDBiIiwiZXhwIjoxNzg4MDMzMDA4fQ.jKhwK7R6upvEUB2dLo8HzW-LZtIlOG801IZX87DKUJE';

// 3. Paste your deployed smart contract address.
const CONTRACT_ADDRESS = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B';

// 4. Paste your contract's ABI from Remix.
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getIdentity",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_cid",
				"type": "string"
			}
		],
		"name": "setIdentity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

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

// --- STATE MANAGEMENT ---
let provider;
let signer;
let capturedImageBlob = null;

// --- FUNCTIONS ---

// 1. Wallet Connection
async function connectWallet() {
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

    canvas.toBlob(blob => {
        capturedImageBlob = blob;
    }, 'image/jpeg');
}

// 3. Pinata IPFS Upload Logic
async function storeOnPinata(formData, imageBlob) {
    if (!imageBlob) {
        throw new Error("No image captured to upload.");
    }

    // Create a JSON object with all form data
    const identityData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        nationality: formData.get('nationality'),
        createdAt: new Date().toISOString()
    };
    
    // Use FormData to package our files for upload.
    const data = new FormData();
    data.append('file', imageBlob, 'photo.jpeg');
    data.append('file', new Blob([JSON.stringify(identityData)], { type: 'application/json' }), 'identity.json');

    console.log("Uploading files to IPFS via Pinata...");

    try {
        // Use axios to send the request to Pinata
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });
        
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
    if (!signer) {
        throw new Error("Wallet not connected.");
    }
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
        photoPreview.style.display = 'none';
        video.style.display = 'block';
        capturedImageBlob = null;
    } catch (error) {
        console.error("ID creation failed:", error);
        showModal('error', 'Creation Failed', error.message);
    }
}

// 6. Modal UI Helper (no changes needed)
function showModal(type, title, text) { /* ... same as before ... */ }

// --- EVENT LISTENERS ---
window.addEventListener('load', startCamera);
connectWalletBtn.addEventListener('click', connectWallet);
captureBtn.addEventListener('click', takePicture);
form.addEventListener('submit', handleFormSubmit);
closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });

// We need to import axios. Add these lines to your HTML file,
// or use a bundler like Vite or Webpack in a more advanced setup.
// For now, let's add the script tag to the HTML.

// NOTE: Since we are not using a bundler, we need to add the axios
// script tag to the HTML file and we can't use `import` here.
// The code has been adapted to assume axios is loaded via a script tag.