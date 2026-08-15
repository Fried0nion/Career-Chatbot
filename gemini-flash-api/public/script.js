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
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.querySelector('.modal-close');

// Preserve the original send-button icon (SVG arrow) so we can restore it
// after temporarily showing a loading state, instead of leaving plain text.
const sendButtonIconHTML = submitButton.innerHTML;

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

// ============================================================================
// Image Modal Event Listeners
// ============================================================================
modalClose.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  imageModal.classList.remove('active');
});

imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) {
    imageModal.classList.remove('active');
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    imageModal.classList.remove('active');
  }
});

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

  const typeName =
    type === 'image'
      ? 'Image'
      : type === 'audio'
        ? 'Audio'
        : 'Document';

  showFileIndicator(`✓ ${typeName} selected: ${file.name}`, type);

  // The selected audio is shown only by the file indicator.
  // The custom audio player is created after the file is sent to the chat.
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
      // Use user message as prompt if provided, otherwise generate summary + feedback
      let prompt;

      if (userMessage) {
        prompt = userMessage;
      } else {
        // Generate automatic summary and feedback prompt based on file type
        if (selectedFileType === 'document') {
          prompt =
            `Please provide a comprehensive summary of this document, ` +
            `followed by professional feedback and recommendations for improvement.`;
        } else if (selectedFileType === 'image') {
          prompt =
            `Please provide a summary of what is shown in this image, ` +
            `followed by professional feedback and recommendations for improvement.`;
        } else if (selectedFileType === 'audio') {
          prompt =
            `Please transcribe this audio file and provide a summary of the content, ` +
            `followed by professional feedback and recommendations for improvement.`;
        }
      }

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
    appendMessage(
      'bot',
      `Sorry, no response received. (${error.message})`
    );
  } finally {
    isWaitingForResponse = false;
    submitButton.disabled = false;
    submitButton.innerHTML = sendButtonIconHTML;
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
      const lastBotMessage =
        thinkingMessages[thinkingMessages.length - 1];

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
  // Create a file reference for displaying media
  const fileURL = URL.createObjectURL(selectedFile);

  // Add file indicator message
  if (selectedFileType === 'image') {
    appendFileMessage(
      'user',
      selectedFileType,
      selectedFile.name,
      fileURL
    );

  } else if (selectedFileType === 'audio') {
    // Display the custom audio player on the right side in chatbox
    appendAudioMessage(
      'user',
      selectedFile.name,
      fileURL,
      selectedFile.type
    );

  } else {
    appendMessage('user', `📎 ${selectedFile.name}`);
  }

  if (prompt) {
    appendMessage('user', prompt);
  }

  // Show thinking placeholder
  const thinkingElement = appendMessage('bot', 'Analyzing...');

  isWaitingForResponse = true;
  submitButton.disabled = true;

  try {
    let endpoint = '';
    let formData = new FormData();

    formData.append(
      selectedFileType === 'document'
        ? 'document'
        : selectedFileType === 'audio'
          ? 'audio'
          : 'image',
      selectedFile
    );

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
      const errorData =
        await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
        `Server error: ${response.status}`
      );
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

    // Note: we intentionally do NOT revoke the object URL here.
    // The image/audio element stays in the chat history (and can be
    // reopened in the modal) for the rest of the session, so revoking
    // it would break that thumbnail. The browser releases blob URLs
    // automatically when the page/tab is closed.

  } catch (error) {
    // Remove thinking message
    const thinkingMessages =
      chatBox.querySelectorAll('.message.bot');

    if (thinkingMessages.length > 0) {
      const lastBotMessage =
        thinkingMessages[thinkingMessages.length - 1];

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
      const errorData =
        await response.json().catch(() => ({}));

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
      throw new Error(
        'Network error: Unable to reach server'
      );
    }

    throw error;
  }
}

// ============================================================================
// Custom Audio Player
// ============================================================================
/**
 * Formats seconds as m:ss
 * @param {number} seconds
 * @returns {string}
 */
function formatAudioTime(seconds) {
  if (
    !isFinite(seconds) ||
    isNaN(seconds) ||
    seconds < 0
  ) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Builds a fully custom, consistently-styled audio player
 * instead of relying on the browser's native audio controls.
 */
function createCustomAudioPlayer(
  fileName,
  fileURL,
  mimeType
) {
  const audio = new Audio();

  audio.preload = 'metadata';
  audio.src = fileURL;

  if (mimeType) {
    audio.setAttribute('type', mimeType);
  }

  const player = document.createElement('div');
  player.className = 'custom-audio-player';

  // Label row
  const label = document.createElement('div');
  label.className = 'audio-label';

  label.innerHTML =
    '<i class="fas fa-music"></i>' +
    '<span class="audio-filename"></span>';

  label.querySelector('.audio-filename').textContent =
    fileName;

  // Controls row
  const controls = document.createElement('div');
  controls.className = 'audio-controls';

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'audio-play-btn';
  playBtn.setAttribute('aria-label', 'Play');
  playBtn.innerHTML =
    '<i class="fas fa-play"></i>';

  const timeDisplay = document.createElement('span');
  timeDisplay.className = 'audio-time';
  timeDisplay.textContent = '0:00 / 0:00';

  const seek = document.createElement('input');
  seek.type = 'range';
  seek.className = 'audio-seek';
  seek.min = '0';
  seek.max = '100';
  seek.step = '0.1';
  seek.value = '0';

  const volumeBtn = document.createElement('button');
  volumeBtn.type = 'button';
  volumeBtn.className = 'audio-volume-btn';
  volumeBtn.setAttribute('aria-label', 'Mute');
  volumeBtn.innerHTML =
    '<i class="fas fa-volume-up"></i>';

  const menuWrapper = document.createElement('div');
  menuWrapper.className = 'audio-menu-wrapper';

  const menuBtn = document.createElement('button');
  menuBtn.type = 'button';
  menuBtn.className = 'audio-menu-btn';
  menuBtn.setAttribute(
    'aria-label',
    'More options'
  );
  menuBtn.innerHTML =
    '<i class="fas fa-ellipsis-vertical"></i>';

  const menuDropdown = document.createElement('div');
  menuDropdown.className = 'audio-menu-dropdown';

  const downloadLink = document.createElement('a');
  downloadLink.href = fileURL;
  downloadLink.download = fileName;
  downloadLink.textContent = 'Download';

  menuDropdown.appendChild(downloadLink);

  menuWrapper.appendChild(menuBtn);
  menuWrapper.appendChild(menuDropdown);

  controls.appendChild(playBtn);
  controls.appendChild(timeDisplay);
  controls.appendChild(seek);
  controls.appendChild(volumeBtn);
  controls.appendChild(menuWrapper);

  player.appendChild(label);
  player.appendChild(controls);

  // ---- Behavior ----
  let isSeeking = false;

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    playBtn.innerHTML =
      '<i class="fas fa-pause"></i>';

    playBtn.setAttribute(
      'aria-label',
      'Pause'
    );
  });

  audio.addEventListener('pause', () => {
    playBtn.innerHTML =
      '<i class="fas fa-play"></i>';

    playBtn.setAttribute(
      'aria-label',
      'Play'
    );
  });

  audio.addEventListener('ended', () => {
    playBtn.innerHTML =
      '<i class="fas fa-play"></i>';

    playBtn.setAttribute(
      'aria-label',
      'Play'
    );

    seek.value = '0';
  });

  audio.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent =
      `${formatAudioTime(0)} / ` +
      `${formatAudioTime(audio.duration)}`;
  });

  audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;

    const duration = audio.duration || 0;

    const progress = duration
      ? (audio.currentTime / duration) * 100
      : 0;

    seek.value = progress.toString();

    timeDisplay.textContent =
      `${formatAudioTime(audio.currentTime)} / ` +
      `${formatAudioTime(duration)}`;
  });

  seek.addEventListener('input', () => {
    isSeeking = true;

    const duration = audio.duration || 0;

    timeDisplay.textContent =
      `${formatAudioTime(
        (seek.value / 100) * duration
      )} / ${formatAudioTime(duration)}`;
  });

  seek.addEventListener('change', () => {
    const duration = audio.duration || 0;

    audio.currentTime =
      (seek.value / 100) * duration;

    isSeeking = false;
  });

  let lastVolume = 1;

  volumeBtn.addEventListener('click', () => {
    if (
      audio.muted ||
      audio.volume === 0
    ) {
      audio.muted = false;
      audio.volume = lastVolume || 1;

      volumeBtn.innerHTML =
        '<i class="fas fa-volume-up"></i>';

    } else {
      lastVolume = audio.volume;
      audio.muted = true;

      volumeBtn.innerHTML =
        '<i class="fas fa-volume-mute"></i>';
    }
  });

  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Close any other open menus first
    document
      .querySelectorAll(
        '.audio-menu-dropdown.open'
      )
      .forEach((el) => {
        if (el !== menuDropdown) {
          el.classList.remove('open');
        }
      });

    menuDropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!menuWrapper.contains(e.target)) {
      menuDropdown.classList.remove('open');
    }
  });

  player.pauseAudio = () => audio.pause();

  return player;
}

// ============================================================================
// UI Utilities
// ============================================================================
/**
 * Appends an audio message to the chat box.
 */
function appendAudioMessage(
  sender,
  fileName,
  fileURL,
  mimeType
) {
  const messageDiv =
    document.createElement('div');

  messageDiv.className =
    `message ${sender}`;

  const contentDiv =
    document.createElement('div');

  contentDiv.className =
    'message-content message-content--audio';

  const player =
    createCustomAudioPlayer(
      fileName,
      fileURL,
      mimeType
    );

  contentDiv.appendChild(player);

  messageDiv.appendChild(contentDiv);
  chatBox.appendChild(messageDiv);

  chatBox.scrollTop =
    chatBox.scrollHeight;

  return messageDiv;
}

/**
 * Appends a file (image or audio) message
 * to the chat box.
 */
function appendFileMessage(
  sender,
  fileType,
  fileName,
  fileURL
) {
  // Route audio through the single audio message
  // renderer so there is only ever one audio
  // player implementation/style in the chat box.
  if (fileType === 'audio') {
    return appendAudioMessage(
      sender,
      fileName,
      fileURL
    );
  }

  const messageDiv =
    document.createElement('div');

  messageDiv.className =
    `message ${sender}`;

  const contentDiv =
    document.createElement('div');

  contentDiv.className =
    'message-content';

  // Apply styling for user messages
  if (sender === 'user') {
    contentDiv.style.background =
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    contentDiv.style.color = '#fff';
    contentDiv.style.padding = '8px';
  }

  if (fileType === 'image') {
    const img =
      document.createElement('img');

    img.src = fileURL;
    img.alt = fileName;
    img.className = 'message-image';

    img.style.cursor = 'pointer';
    img.style.maxWidth = '100%';
    img.style.borderRadius = '12px';
    img.style.display = 'block';

    // Open image in modal on click
    img.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Update modal image source
      modalImage.src = fileURL;
      modalImage.alt = fileName;

      // Show modal
      imageModal.classList.add('active');
    });

    // Also add error handling
    img.addEventListener('error', () => {
      console.error(
        'Failed to load image:',
        fileURL
      );
    });

    contentDiv.appendChild(img);
  }

  messageDiv.appendChild(contentDiv);
  chatBox.appendChild(messageDiv);

  chatBox.scrollTop =
    chatBox.scrollHeight;

  return messageDiv;
}

/**
 * Parse markdown text and convert it to HTML elements.
 */
function parseMarkdown(text) {
  const container =
    document.createElement('div');

  // Split text into lines
  let lines = text.split('\n');
  let html = '';
  let inList = false;
  let listType = null;
  let inCodeBlock = false;
  let codeBlock = '';

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    let line = lines[i];

    // Handle code blocks
    if (
      line.trim().startsWith('```')
    ) {
      if (inCodeBlock) {
        html +=
          `<pre><code>${escapeHtml(
            codeBlock.trim()
          )}</code></pre>`;

        codeBlock = '';
        inCodeBlock = false;

      } else {
        inCodeBlock = true;
        codeBlock = '';
      }

      continue;
    }

    if (inCodeBlock) {
      codeBlock += line + '\n';
      continue;
    }

    // Close list if line doesn't start with list marker
    if (
      inList &&
      !line.trim().match(/^[-*+]\s/) &&
      !line.trim().match(/^\d+\.\s/)
    ) {
      html +=
        listType === 'ul'
          ? '</ul>'
          : '</ol>';

      inList = false;
      listType = null;
    }

    // Handle headings
    if (line.match(/^###\s+/)) {
      html +=
        `<h3>${escapeHtml(
          line.replace(
            /^###\s+/,
            ''
          )
        )}</h3>`;

    } else if (line.match(/^##\s+/)) {
      html +=
        `<h2>${escapeHtml(
          line.replace(
            /^##\s+/,
            ''
          )
        )}</h2>`;

    } else if (line.match(/^#\s+/)) {
      html +=
        `<h1>${escapeHtml(
          line.replace(
            /^#\s+/,
            ''
          )
        )}</h1>`;
    }

    // Handle unordered lists
    else if (
      line.trim().match(
        /^[-*+]\s+/
      )
    ) {
      const listItem =
        line.trim().replace(
          /^[-*+]\s+/,
          ''
        );

      if (
        !inList ||
        listType !== 'ul'
      ) {
        if (inList) {
          html +=
            listType === 'ul'
              ? '</ul>'
              : '</ol>';
        }

        html += '<ul>';
        inList = true;
        listType = 'ul';
      }

      html +=
        `<li>${formatInlineMarkdown(
          listItem
        )}</li>`;
    }

    // Handle ordered lists
    else if (
      line.trim().match(
        /^\d+\.\s+/
      )
    ) {
      const listItem =
        line.trim().replace(
          /^\d+\.\s+/,
          ''
        );

      if (
        !inList ||
        listType !== 'ol'
      ) {
        if (inList) {
          html +=
            listType === 'ul'
              ? '</ul>'
              : '</ol>';
        }

        html += '<ol>';
        inList = true;
        listType = 'ol';
      }

      html +=
        `<li>${formatInlineMarkdown(
          listItem
        )}</li>`;
    }

    // Handle blockquotes
    else if (
      line.trim().startsWith('>')
    ) {
      const quote =
        line.trim().replace(
          /^>\s*/,
          ''
        );

      html +=
        `<blockquote>${formatInlineMarkdown(
          quote
        )}</blockquote>`;
    }

    // Handle horizontal rules
    else if (
      line.trim().match(
        /^[-*_]{3,}$/
      )
    ) {
      html += '<hr>';
    }

    // Handle paragraphs
    else if (line.trim()) {
      html +=
        `<p>${formatInlineMarkdown(
          line
        )}</p>`;
    }

    // Empty line
    else if (
      line.trim() === '' &&
      html &&
      !html.endsWith('</p>') &&
      !html.endsWith('</li>')
    ) {
      // Natural paragraph break
    }
  }

  // Close any open lists
  if (inList) {
    html +=
      listType === 'ul'
        ? '</ul>'
        : '</ol>';
  }

  // Close code block if still open
  if (inCodeBlock) {
    html +=
      `<pre><code>${escapeHtml(
        codeBlock.trim()
      )}</code></pre>`;
  }

  container.innerHTML = html;

  return container;
}

/**
 * Format inline markdown
 * (bold, italic, code, links)
 */
function formatInlineMarkdown(text) {
  text = escapeHtml(text);

  // Bold (**text** or __text__)
  text = text.replace(
    /\*\*(.+?)\*\*/g,
    '<strong>$1</strong>'
  );

  text = text.replace(
    /__(.+?)__/g,
    '<strong>$1</strong>'
  );

  // Italic (*text* or _text_)
  text = text.replace(
    /\*(.+?)\*/g,
    '<em>$1</em>'
  );

  text = text.replace(
    /_(.+?)_/g,
    '<em>$1</em>'
  );

  // Inline code (`text`)
  text = text.replace(
    /`(.+?)`/g,
    '<code>$1</code>'
  );

  // Links [text](url)
  text = text.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank">$1</a>'
  );

  return text;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(
    /[&<>"']/g,
    char => map[char]
  );
}

/**
 * Appends a message to the chat box
 */
function appendMessage(
  sender,
  text
) {
  if (
    !['user', 'bot'].includes(sender)
  ) {
    console.warn(
      `Invalid sender type: ${sender}`
    );

    return null;
  }

  if (
    !text ||
    typeof text !== 'string'
  ) {
    console.warn(
      'Invalid message text'
    );

    return null;
  }

  const messageDiv =
    document.createElement('div');

  messageDiv.className =
    `message ${sender}`;

  const contentDiv =
    document.createElement('div');

  contentDiv.className =
    'message-content';

  // Parse markdown for bot messages,
  // plain text for user messages
  if (sender === 'bot') {
    const parsedContent =
      parseMarkdown(text);

    contentDiv.appendChild(
      parsedContent
    );

  } else {
    contentDiv.textContent = text;
  }

  messageDiv.appendChild(contentDiv);
  chatBox.appendChild(messageDiv);

  chatBox.scrollTop =
    chatBox.scrollHeight;

  return messageDiv;
}