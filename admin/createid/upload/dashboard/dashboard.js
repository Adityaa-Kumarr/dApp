// Mock user data (this should ideally come from backend/localStorage)
const userData = {
  name: "Aditya Kumar",
  email: "aditya@mail.com",
  phone: "+91 9876543210",
  wallet: "0xAB12CD34EF56...",
  photo: "user-photo.png",
  documents: [
    { type: "Identity Card", file: "aadhaar.pdf", status: "Verified" },
    { type: "Passport", file: "passport.png", status: "Pending" }
  ]
};

// Load user details
document.getElementById("userName").innerText = userData.name;
document.getElementById("profileName").innerText = userData.name;
document.getElementById("profileEmail").innerText = userData.email;
document.getElementById("profilePhone").innerText = userData.phone;
document.getElementById("profileWallet").innerText = userData.wallet;
document.getElementById("userPhoto").src = userData.photo;

// Load documents
const docsTable = document.querySelector("#docsTable tbody");
userData.documents.forEach(doc => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${doc.type}</td>
    <td>${doc.file}</td>
    <td>${doc.status}</td>
  `;
  docsTable.appendChild(row);
});
