// --- CONFIGURATION ---
const COINBASE_APP_ID = '4cd77bf5-76b7-445e-bf24-74deea94b6d1'; // Your real App ID

let coinbasePay = null;

// --- FUNCTIONS ---

function initializeCoinbaseSDK() {
    if (window.coinbasePay) {
        coinbasePay = new window.coinbasePay({
            appId: COINBASE_APP_ID,
            onSuccess: (response) => {
                const { address } = response;
                console.log("Wallet connected:", address);
                
                // Get the original page's URL from the query parameter
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get('returnUrl') || '../createid.html'; // Default fallback

                // Redirect back to the original page with the address
                window.location.href = `${returnUrl}?walletAddress=${address}`;
            },
            onExit: () => console.log("User exited the wallet connection flow."),
            onError: (error) => {
                console.error("Failed to connect wallet:", error);
                alert("Failed to connect wallet.");
            }
        });
    } else {
        console.error('Coinbase Pay SDK could not be initialized.');
    }
}

function connectWallet() {
    if (!coinbasePay) {
        alert('Coinbase SDK not initialized. Please refresh.');
        return;
    }
    coinbasePay.open({ experience: 'embedded' });
}

// --- INITIALIZATION ---
function initializeApp() {
    initializeCoinbaseSDK();
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    connectWalletBtn.addEventListener('click', connectWallet);
}

// Robustly wait for the SDK to load
function waitForSDK() {
    let attempts = 0;
    const interval = setInterval(() => {
        if (window.coinbasePay) {
            clearInterval(interval);
            initializeApp();
        } else if (++attempts > 20) {
            clearInterval(interval);
            alert("Could not load wallet components. Please check your internet connection and refresh.");
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', waitForSDK);
