// DOM Elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const notepad = document.getElementById('notepad');
const statusText = document.getElementById('status-text');

// Initialize Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    statusText.innerText = "Status: Dictating...";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    notepad.value += " " + transcript;
  };

  recognition.onend = () => {
    statusText.innerText = "Status: Paused";
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  startBtn.onclick = () => recognition.start();
  stopBtn.onclick = () => recognition.stop();
} else {
  statusText.innerText = "Status: Speech API not supported in this browser";
}

// Utility Export Functions (Testable silently right now!)
function copyText() {
  if (!notepad.value) return alert("Nothing to copy yet!");
  navigator.clipboard.writeText(notepad.value);
  alert("Text copied to clipboard!");
}

function sendToDocs() {
  if (notepad.value) {
    navigator.clipboard.writeText(notepad.value);
    alert("Copied text to clipboard! Opening a fresh Google Doc...");
  }
  window.open('https://docs.new', '_blank');
}

function sendToOutlook() {
  const bodyText = encodeURIComponent(notepad.value);
  window.location.href = `mailto:?subject=Thought%20Dump%20Notes&body=${bodyText}`;
}

function clearText() {
  if (confirm("Are you sure you want to clear your notes?")) {
    notepad.value = "";
  }
}

function triggerAICleanup() {
  alert("Stripe Checkout Flow: This will connect to $0.99 payment + GPT-4o API tonight!");
}