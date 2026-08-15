// ============================================================================
// Chatbot Frontend Script - Production Ready with File Upload Support
// ============================================================================

// DOM Elements
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]');
const imageUpload = document.getElementById('image-upload');
const fileUpload = document.getElementById('file-upload');
const audioUpload = document.getElementById('audio-upload');
const fileIndicator = document.getElementById('file-indicator');

// State management
let conversation = [];
let isWaitingForResponse = false;
let selectedFile = null;
let selectedFileType = null;

// ============================================================================
// File Upload Event Listeners
// ============================================================================
imageUpload.addEventListener('change', (e) => handleFileSelect(e, 'image'));
fileUpload.addEventListener('change', (e) => handleFileSelect(e, 'document'));
audioUpload.addEventListener('change', (e) => handleFileSelect(e, 'audio'));

function handleFileSelect(e, type) {
  const file = e.target.files[0];
  
  if (!file) return;

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showFileIndicator(`File too large. Maximum size: 10MB`, 'error');
    e.target.value = '';
    return;
  }

  selectedFile = file;
  selectedFileType = type;

  const typeName = type === 'image' ? 'Image' : type === 'audio' ? 'Audio' : 'Document';
  showFileIndicator(`✓ ${typeName} selected: ${file.name}`, type);
}

function showFileIndicator(message, type) {
  fileIndicator.textContent = message;
  fileIndicator.className = `file-indicator active ${type}`;
}

function clearFileIndicator() {
  fileIndicator.textContent = '';
  fileIndicator.className = 'file-indicator';
  selectedFile = null;
  selectedFileType = null;
  imageUpload.value = '';
  fileUpload.value = '';
  audioUpload.value = '';
}

// ============================================================================
// Main Form Submission
// ============================================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (isWaitingForResponse) return;

  const userMessage = input.value.trim();

  // Check if file or message exists
  if (!userMessage && !selectedFile) {
    console.warn('No message or file provided');
    return;
  }

  try {
    // If file is selected, send file with prompt
    if (selectedFile) {
      // Use user message as prompt if provided, otherwise use default
      const prompt = userMessage || `Please analyze this ${selectedFileType}.`;
      await handleFileUpload(prompt);
      clearFileIndicator();
    } 
    // Otherwise, send regular chat message
    else if (userMessage) {
      await handleChatMessage(userMessage);
    }

    input.value = '';

  } catch (error) {
    console.error('Error:', error);
    appendMessage('bot', `Sorry, no response received. (${error.message})`);
  } finally {
    isWaitingForResponse = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Send';
  }
});

// ============================================================================
// Handle Regular Chat Messages
// ============================================================================
async function handleChatMessage(userMessage) {
  // Add user message to UI
  appendMessage('user', userMessage);

  // Add to conversation history
  conversation.push({
    role: 'user',
    text: userMessage
  });

  // Show thinking placeholder
  const thinkingElement = appendMessage('bot', 'Thinking...');

  // Set loading state
  isWaitingForResponse = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  try {
    // Send to chat endpoint
    const botResponse = await sendMessageToBackend(conversation);

    // Remove thinking message
    if (thinkingElement && thinkingElement.parentNode) {
      thinkingElement.parentNode.removeChild(thinkingElement);
    }

    // Show bot response
    appendMessage('bot', botResponse);

    // Add to conversation
    conversation.push({
      role: 'model',
      text: botResponse
    });

  } catch (error) {
    // Remove thinking message
    const thinkingMessages = chatBox.querySelectorAll('.message.bot');
    if (thinkingMessages.length > 0) {
      const lastBotMessage = thinkingMessages[thinkingMessages.length - 1];
      if (lastBotMessage.textContent === 'Thinking...') {
        lastBotMessage.parentNode.removeChild(lastBotMessage);
      }
    }
    throw error;
  }
}

// ============================================================================
// Handle File Uploads
// ============================================================================
async function handleFileUpload(prompt) {
  // Add user message to UI
  appendMessage('user', `📎 ${selectedFile.name}`);
  if (prompt) {
    appendMessage('user', prompt);
  }

  // Show thinking placeholder
  const thinkingElement = appendMessage('bot', 'Analyzing...');

  isWaitingForResponse = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  try {
    let endpoint = '';
    let formData = new FormData();
    formData.append(selectedFileType === 'document' ? 'document' : 
                   selectedFileType === 'audio' ? 'audio' : 
                   'image', selectedFile);
    formData.append('prompt', prompt);

    // Determine endpoint based on file type
    if (selectedFileType === 'image') {
      endpoint = '/generate-from-image';
    } else if (selectedFileType === 'document') {
      endpoint = '/generate-from-document';
    } else if (selectedFileType === 'audio') {
      endpoint = '/generate-from-audio';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error('No result in server response');
    }

    // Remove thinking message
    if (thinkingElement && thinkingElement.parentNode) {
      thinkingElement.parentNode.removeChild(thinkingElement);
    }

    // Show response
    appendMessage('bot', data.result);

  } catch (error) {
    // Remove thinking message
    const thinkingMessages = chatBox.querySelectorAll('.message.bot');
    if (thinkingMessages.length > 0) {
      const lastBotMessage = thinkingMessages[thinkingMessages.length - 1];
      if (lastBotMessage.textContent === 'Analyzing...') {
        lastBotMessage.parentNode.removeChild(lastBotMessage);
      }
    }
    throw error;
  }
}

// ============================================================================
// API Communication
// ============================================================================
/**
 * Sends conversation to /api/chat endpoint
 * @param {Array} conversationHistory - Array of message objects
 * @returns {Promise<string>} - AI response text
 */
async function sendMessageToBackend(conversationHistory) {
  const payload = {
    conversation: conversationHistory
  };

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || 
        errorData.message || 
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error('No result property in server response');
    }

    return data.result;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON response from server');
    }
    if (error instanceof TypeError) {
      throw new Error('Network error: Unable to reach server');
    }
    throw error;
  }
}

// ============================================================================
// UI Utilities
// ============================================================================
/**
 * Appends a message to the chat box
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - Message text
 * @returns {HTMLElement} - The created message element
 */
function appendMessage(sender, text) {
  if (!['user', 'bot'].includes(sender)) {
    console.warn(`Invalid sender type: ${sender}`);
    return null;
  }

  if (!text || typeof text !== 'string') {
    console.warn('Invalid message text');
    return null;
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = text;

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  return messageDiv;
}
