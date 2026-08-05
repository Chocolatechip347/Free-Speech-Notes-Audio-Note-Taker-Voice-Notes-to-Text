// Google Drive & Docs API Configuration
const CLIENT_ID = '77521483085-00bbkjm3k8bs4s3q04sic19iikl1mc87.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';

let tokenClient;

// Helper to safely retrieve notepad text
function getTranscriptText() {
  const notepad = document.getElementById('notepad');
  return notepad ? notepad.value : '';
}

// 1. Google Docs Export (Direct API Write)
window.exportToGoogleDocs = function() {
  const textContent = getTranscriptText();

  if (!textContent.trim()) {
    alert("There is no text to save!");
    return;
  }

  if (!tokenClient) {
    alert("Google Service is not initialized yet. Please make sure Google SDK loaded.");
    return;
  }

  // Define what happens when Google returns the access token
  tokenClient.callback = async (response) => {
    if (response.error) {
      console.error("Google Auth Error:", response);
      alert("Google authorization failed.");
      return;
    }

    const accessToken = response.access_token;

    try {
      // Step A: Create a blank document
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'ThoughtFlow Note - ' + new Date().toLocaleDateString()
        })
      });

      if (!createRes.ok) throw new Error("Failed to create document.");
      const doc = await createRes.json();
      const documentId = doc.documentId;

      // Step B: Insert the text from your notepad into index 1
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: textContent
              }
            }
          ]
        })
      });

      if (!updateRes.ok) throw new Error("Failed to write text into document.");

      // Step C: Open the finished document in a new tab
      window.open(`https://docs.google.com/document/d/${documentId}/edit`, '_blank');

    } catch (err) {
      console.error("Export Error:", err);
      alert("Error saving directly to Google Docs. Check console for details.");
    }
  };

  // Trigger Google Login / Permission Prompt
  tokenClient.requestAccessToken();
};

// 2. Copy Text Function
window.copyText = function() {
  const text = getTranscriptText();
  if (!text.trim()) return alert("Nothing to copy!");
  navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
};

// 3. Clear Text Function
window.clearText = function() {
  const notepad = document.getElementById('notepad');
  if (notepad && confirm("Are you sure you want to clear your notes?")) {
    notepad.value = '';
  }
};

// 4. Send via Email Function
window.sendToOutlook = function() {
  const text = getTranscriptText();
  if (!text.trim()) return alert("Nothing to send!");
  const mailtoUrl = `mailto:?subject=${encodeURIComponent("ThoughtFlow Note")}&body=${encodeURIComponent(text)}`;
  window.location.href = mailtoUrl;
};

// 5. AI Cleanup Function
window.triggerAICleanup = function() {
  alert("AI Clean-Up payment integration coming soon!");
};

// Initialize Google Identity Client on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  if (window.google) {
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: () => {} // Callback set dynamically in exportToGoogleDocs
      });
    } catch (e) {
      console.warn("Google Identity Client initialization skipped:", e);
    }
  }
});
