// Google Drive API Configuration
const CLIENT_ID = '77521483085-00bbkjm3k8bs4s3q04sic19iikl1mc87.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;

// Helper to safely retrieve notepad text
function getTranscriptText() {
  const notepad = document.getElementById('notepad');
  return notepad ? notepad.value : '';
}

// 1. Google Docs Export (Clipboard + docs.new Fast Fallback)
window.exportToGoogleDocs = function() {
  const textContent = getTranscriptText();
  
  if (!textContent.trim()) {
    alert("There is no text to save!");
    return;
  }

  // 1. Copy to clipboard
  navigator.clipboard.writeText(textContent).then(() => {
    alert("Transcript copied to clipboard! Opening Google Docs—press Ctrl+V (or Cmd+V) to paste.");
  }).catch(err => {
    console.error("Clipboard copy failed:", err);
  });

  // 2. Open tab immediately so the browser does not block it as a popup
  window.open('https://docs.new', '_blank');
};

  // Copies text to clipboard and launches Google Docs
  navigator.clipboard.writeText(textContent).then(() => {
    alert("Transcript copied to clipboard! Opening Google Docs—press Ctrl+V (or Cmd+V) to paste.");
    window.open('https://docs.new', '_blank');
  }).catch(err => {
    console.error("Clipboard copy failed:", err);
    alert("Failed to copy text automatically. Please copy your notes manually.");
  });
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
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) {
            console.log("Google Access Token Received:", tokenResponse.access_token);
          }
        },
      });
    } catch (e) {
      console.warn("Google Identity Client initialization skipped:", e);
    }
  }
});
