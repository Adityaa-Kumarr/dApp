document.getElementById("uploadForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const docType = document.getElementById("docType").value;
  const file = document.getElementById("fileUpload").files[0];

  if (!docType || !file) {
    document.getElementById("uploadStatus").innerText = "Please select document type and file.";
    document.getElementById("uploadStatus").style.color = "red";
    return;
  }

  // Simulate upload
  setTimeout(() => {
    document.getElementById("uploadStatus").innerText = `${file.name} uploaded successfully as ${docType}.`;
    document.getElementById("uploadStatus").style.color = "green";
  }, 1500);
});
