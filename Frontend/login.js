// Show selected file name
document.getElementById("chatHistory").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const label = e.target.nextElementSibling;
    label.textContent = `📁 ${file.name} selected`;
  }
});
//consent
const consent=document.getElementById("privacyConsent");
if(!consent || !consent.checked){
  alert("Plese provide privacy consent before continuing");
  return;
}
// Handle form submission
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // prevent default refresh

  const fileInput = document.getElementById("chatHistory");
  const chatFile = fileInput.files[0];

  if (!chatFile) {
    alert("❌ Please select a chat file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("chatFile", chatFile); // MUST match multer field name

  // Append all other user inputs
  formData.append("email", document.getElementById("email").value);
  formData.append("lovedOneName", document.getElementById("lovedOneName").value);
  formData.append("relationship", document.getElementById("relationship").value);
  formData.append("personality", document.getElementById("personality").value);
  formData.append("interests", document.getElementById("interests").value);

  // Get and validate API key
  const geminiApiKey = document.getElementById("geminiApiKey").value.trim();
  if (!geminiApiKey) {
    alert("❌ Please enter your Gemini API key.");
    return;
  }

  // Store API key securely in sessionStorage
  sessionStorage.setItem("gemini_api_key", geminiApiKey);

  try {
    // Get backend URL from environment or default to localhost
    const backendUrl = window.BACKEND_URL || "http://localhost:5000";
    
    const response = await fetch(`${backendUrl}/upload-chat`, {
      method: "POST",
      headers: {
        "x-gemini-api-key": geminiApiKey
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ File uploaded and user data saved.");

      // Save user data in localStorage for chat.html
      localStorage.setItem("heartsyncUserData", JSON.stringify({
        email: formData.get("email"),
        lovedOneName: formData.get("lovedOneName"),
        relationship: formData.get("relationship"),
        personality: formData.get("personality"),
        interests: formData.get("interests"),
        fileName: chatFile.name
      }));

      // Redirect to chat.html
      window.location.href = "chat.html";
    } else {
      alert("❌ Upload failed: " + result.message);
    }
  } catch (err) {
    console.error("❌ Upload error:", err);
    alert("Upload failed. Make sure your server is running.");
  }
});
