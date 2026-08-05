// Google Drive & Docs API Configuration
const CLIENT_ID = '77521483085-00bbkjm3k8bs4s3q04sic19iikl1mc87.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';

let tokenClient = null;

// Helper to safely retrieve notepad text
function getTranscriptText() {
  const notepad = document.getElementById('notepad');
  return notepad ? notepad.value : '';
}

// Ensure Google Identity Services client is initialized
function ensureGoogleClient() {
  if (tokenClient) return true;

  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: () => {} // Overridden dynamically in exportToGoogleDocs
      });
      return true;
    } catch (e) {
      console.error("Failed to initialize Google Token Client:", e);
      return false;
    }
  }
  return false;
}

// 1. Google Docs Export (Direct API Write)
window.exportToGoogleDocs = function() {
  const textContent = getTranscriptText();

  if (!textContent.trim()) {
    alert("There is no text to save!");
    return;
  }

  // Fallback check if SDK finished loading after page load
  if (!ensureGoogleClient()) {
    alert("Google Identity Services library is not loaded. Please check your index.html script tag or internet connection.");
    return;
  }

  // Pre-open tab synchronously on user click to bypass browser popup blockers
  const newTab = window.open('about:blank', '_blank');

  // Define authorization callback
  tokenClient.callback = async (response) => {
    if (response.error) {
      console.error("Google Auth Error:", response);
      if (newTab) newTab.close();
      alert("Google authorization failed: " + (response.error_description || response.error));
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

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error ? errData.error.message : "Failed to create document.");
      }

      const doc = await createRes.json();
      const documentId = doc.documentId;

      // Step B: Insert the text from notepad at index 1
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

      if (!updateRes.ok) {
        const errData = await updateRes.json();
        throw new Error(errData.error ? errData.error.message : "Failed to write text into document.");
      }

      // Step C: Navigate pre-opened tab to the created Google Doc
      const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
      if (newTab) {
        newTab.location.href = docUrl;
      } else {
        window.open(docUrl, '_blank');
      }

    } catch (err) {
      console.error("Export Error:", err);
      if (newTab) newTab.close();
      alert("Error saving directly to Google Docs: " + err.message);
    }
  };

  // Trigger Google OAuth popup
  tokenClient.requestAccessToken({ prompt: 'consent' });
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

// Initialize Google Identity Client on DOM ready & window load
window.addEventListener('DOMContentLoaded', ensureGoogleClient);
window.addEventListener('load', ensureGoogleClient);
