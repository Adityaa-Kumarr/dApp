/***********************
 * SafeID – Coinbase + Base (Sepolia)
 * Requires:
 *  - ethers v5 UMD
 *  - CoinbaseWalletSDK UMD
 ***********************/

const CONFIG = {
  APP_NAME: "SafeID",
  APP_LOGO: "logo.png", // optional
  BASE_SEPOLIA: {
    CHAIN_ID: 84532, // Base Sepolia
    CHAIN_ID_HEX: "0x14aB",
    RPC_URL: "https://sepolia.base.org",
    EXPLORER: "https://sepolia.basescan.org",
    CURRENCY: { name: "Ether", symbol: "ETH", decimals: 18 },
  },

  // OPTIONAL: If you deploy an IdentityRegistry contract, add it here
  REGISTRY_ADDRESS: "", // e.g. "0xYourContract"
  REGISTRY_ABI: [
    // Minimal example ABI
    // function registerIdentity(bytes32 identityHash) public
    {
      "inputs":[{"internalType":"bytes32","name":"identityHash","type":"bytes32"}],
      "name":"registerIdentity",
      "outputs":[],
      "stateMutability":"nonpayable",
      "type":"function"
    }
  ],
};

let walletSDK, ethProvider, ethersProvider, signer, currentAccount;

/** Initialize Coinbase Wallet SDK provider (EIP-1193) */
function initCoinbaseProvider() {
  walletSDK = new window.CoinbaseWalletSDK({
    appName: CONFIG.APP_NAME,
    appLogoUrl: CONFIG.APP_LOGO,
    darkMode: true,
  });

  // This provider is pre-configured to Base Sepolia
  ethProvider = walletSDK.makeWeb3Provider(
    CONFIG.BASE_SEPOLIA.RPC_URL,
    CONFIG.BASE_SEPOLIA.CHAIN_ID
  );

  // Wrap with ethers.js
  ethersProvider = new ethers.providers.Web3Provider(ethProvider, "any");
}

/** Request account connection */
async function connectCoinbase() {
  try {
    if (!walletSDK) initCoinbaseProvider();

    // Request accounts
    const accounts = await ethersProvider.send("eth_requestAccounts", []);
    currentAccount = ethers.utils.getAddress(accounts[0]);

    // Get signer
    signer = ethersProvider.getSigner();

    // Ensure Base Sepolia
    await ensureBaseSepolia();

    // Build a simple DID string
    const did = `did:pkh:eip155:${CONFIG.BASE_SEPOLIA.CHAIN_ID}:${currentAccount}`;

    // Store minimal session info (you can replace with your storage logic)
    localStorage.setItem(
      "safeIdSession",
      JSON.stringify({ address: currentAccount, did, network: "Base Sepolia" })
    );

    console.log("✅ Connected:", currentAccount, "| DID:", did);
    // Optionally update your UI:
    updateUiOnConnect({ address: currentAccount, did });

    return { address: currentAccount, did };
  } catch (err) {
    console.error("❌ Wallet connect failed:", err);
    alert("Failed to connect Coinbase Wallet.");
    throw err;
  }
}

/** Make sure wallet is on Base Sepolia */
async function ensureBaseSepolia() {
  try {
    await ethProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CONFIG.BASE_SEPOLIA.CHAIN_ID_HEX }],
    });
  } catch (switchErr) {
    // If chain not added, add it
    if (switchErr.code === 4902 || (switchErr.data && switchErr.data.originalError && switchErr.data.originalError.code === 4902)) {
      await ethProvider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CONFIG.BASE_SEPOLIA.CHAIN_ID_HEX,
          chainName: "Base Sepolia",
          nativeCurrency: CONFIG.BASE_SEPOLIA.CURRENCY,
          rpcUrls: [CONFIG.BASE_SEPOLIA.RPC_URL],
          blockExplorerUrls: [CONFIG.BASE_SEPOLIA.EXPLORER],
        }],
      });
    } else {
      throw switchErr;
    }
  }
}

/** Sign a message to bind user → use as lightweight identity proof */
async function signIdentityMessage(profile = {}) {
  if (!signer) throw new Error("Wallet not connected");
  const ts = Math.floor(Date.now() / 1000);
  const msg = `SafeID: Create/Verify Identity\nAddress: ${currentAccount}\nTime: ${ts}\nName: ${profile.name || ""}\nEmail: ${profile.email || ""}\nPhone: ${profile.phone || ""}`;
  const signature = await signer.signMessage(msg);

  // Persist locally (replace with secure storage or backend if needed)
  const rec = { address: currentAccount, ts, profile, signature, msg };
  localStorage.setItem("safeIdProof", JSON.stringify(rec));
  console.log("🖊️ Signed identity message:", rec);
  return rec;
}

/** OPTIONAL: Call your on-chain registry (if deployed) */
async function registerOnChainIdentity(profile = {}) {
  if (!CONFIG.REGISTRY_ADDRESS) {
    throw new Error("No REGISTRY_ADDRESS set. Skip or deploy your contract.");
  }
  if (!signer) throw new Error("Wallet not connected");

  // Create a deterministic hash of core identity fields
  const payload = JSON.stringify({
    address: currentAccount,
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
  });
  const identityHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payload));

  const contract = new ethers.Contract(
    CONFIG.REGISTRY_ADDRESS,
    CONFIG.REGISTRY_ABI,
    signer
  );

  console.log("📦 Sending tx to register identity:", identityHash);
  const tx = await contract.registerIdentity(identityHash);
  const receipt = await tx.wait();
  console.log("✅ On-chain identity registered:", receipt.transactionHash);

  return { txHash: receipt.transactionHash, identityHash };
}

/** Simple UI helpers (optional) */
function updateUiOnConnect({ address, did }) {
  const addrEl = document.getElementById("walletAddress");
  const didEl = document.getElementById("walletDid");
  if (addrEl) addrEl.textContent = address;
  if (didEl) didEl.textContent = did;

  const btn = document.getElementById("connectBtn");
  if (btn) {
    btn.textContent = "Connected";
    btn.disabled = true;
  }
}

/** Example: wire up buttons in your index.html */
window.addEventListener("DOMContentLoaded", () => {
  // Button with id="connectBtn"
  const connectBtn = document.getElementById("connectBtn");
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      await connectCoinbase();
    });
  }

  // Example: sign identity after registration
  const signBtn = document.getElementById("signIdentityBtn");
  if (signBtn) {
    signBtn.addEventListener("click", async () => {
      const name = (document.getElementById("name") || {}).value;
      const email = (document.getElementById("email") || {}).value;
      const phone = (document.getElementById("phone") || {}).value;
      await signIdentityMessage({ name, email, phone });
      alert("Identity message signed and saved locally.");
    });
  }

  // Example: on-chain register button
  const onchainBtn = document.getElementById("onchainRegisterBtn");
  if (onchainBtn) {
    onchainBtn.addEventListener("click", async () => {
      try {
        const name = (document.getElementById("name") || {}).value;
        const email = (document.getElementById("email") || {}).value;
        const phone = (document.getElementById("phone") || {}).value;
        const res = await registerOnChainIdentity({ name, email, phone });
        alert(`On-chain identity registered!\nTx: ${res.txHash}`);
      } catch (e) {
        alert(e.message);
      }
    });
  }
});
