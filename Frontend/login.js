document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("chatHistory");
  const loginForm = document.getElementById("loginForm");
  const consent = document.getElementById("privacyConsent");

  // Make sure the required HTML elements exist.
  if (!fileInput || !loginForm || !consent) {
    console.error("Missing HTML element:", {
      chatHistory: !!fileInput,
      loginForm: !!loginForm,
      privacyConsent: !!consent
    });
    return;
  }

  // Show selected file name.
  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    const label = this.nextElementSibling;

    if (file && label) {
      label.textContent = `📁 ${file.name} selected`;
    }
  });

  // Handle login form submission.
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate consent INSIDE the submit handler.
    if (!consent.checked) {
      alert("Please provide privacy consent before continuing.");
      return;
    }

    const chatFile = fileInput.files[0];

    if (!chatFile) {
      alert("Please select a chat file to upload.");
      return;
    }

    const email = document.getElementById("email").value.trim();
    const lovedOneName =
      document.getElementById("lovedOneName").value.trim();
    const relationship =
      document.getElementById("relationship").value;
    const personality =
      document.getElementById("personality").value;
    const interests =
      document.getElementById("interests").value;

    const apiKeyInput = document.getElementById("geminiApiKey");
    const geminiApiKey = apiKeyInput.value.trim();

    if (!geminiApiKey) {
      alert("Please enter your Gemini API key.");
      return;
    }

    const formData = new FormData();

    // IMPORTANT: Must match upload.single('chatFile') on the backend.
    formData.append("chatFile", chatFile);

    formData.append("email", email);
    formData.append("lovedOneName", lovedOneName);
    formData.append("relationship", relationship);
    formData.append("personality", personality);
    formData.append("interests", interests);

    // Disable repeated submissions.
    const submitButton = loginForm.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const backendUrl =
        window.BACKEND_URL || "http://localhost:5000";

      console.log("Uploading chat file...");

      const response = await fetch(
        `${backendUrl}/upload-chat`,
        {
          method: "POST",
          headers: {
            "x-gemini-api-key": geminiApiKey
          },
          body: formData
        }
      );

      // Read response safely, including server error responses.
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response: ${responseText.slice(0, 200)}`
        );
      }

      console.log("Upload response:", response.status, result);

      if (!response.ok) {
        throw new Error(
          result.message || result.error ||
          `Upload failed with status ${response.status}`
        );
      }

      if (result.success !== true) {
        throw new Error(
          result.message || "The server did not confirm the upload."
        );
      }

      // Save user details for the chat page.
      localStorage.setItem(
        "heartsyncUserData",
        JSON.stringify({
          email,
          lovedOneName,
          relationship,
          personality,
          interests,
          fileName: chatFile.name
        })
      );

      console.log("Upload successful. Redirecting to chat page...");

      // Redirect to chat.html relative to the current page.
      window.location.assign(
        new URL("chat.html", window.location.href).href
      );

    } catch (error) {
      console.error("Login/upload error:", error);
      alert(`Unable to continue: ${error.message}`);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
});