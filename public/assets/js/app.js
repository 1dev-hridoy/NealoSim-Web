class BotChat {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.uid = localStorage.getItem('uid');
    this.usernameDisplay = document.getElementById('usernameDisplay');
    this.profileModal = document.getElementById('profileModal');
    this.botNameElement = document.getElementById('botName');
    this.botAvatarElement = document.getElementById('botAvatar');
    this.botMessageAuthor = document.getElementById('botMessageAuthor');
    this.typingBotName = document.getElementById('typingBotName');
    this.imageViewer = null;

    this.initThemeSystem();
    this.initProfileSystem();
    this.initContactSystem();
    this.init();
  }

  init() {
    if (!this.uid) {
      window.location.href = '/auth';
      return;
    }

    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.chatInput.addEventListener('input', () => this.autoResizeTextarea());

    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.id !== 'settingsButton' && item.id !== 'profileButton' && item.id !== 'contactButton') {
        item.addEventListener('click', (e) => this.handleNavAction(e.target.closest('.nav-item')));
      }
    });

    this.chatInput.focus();
    this.loadCommands();
    this.updateUsername();
    this.loadBotConfig();
  }

  async loadBotConfig() {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      this.botNameElement.textContent = config.botName || 'NexaBot';
      this.botAvatarElement.src = config.botAvatar || 'https://via.placeholder.com/40';
      this.botMessageAuthor.textContent = config.botName || 'NexaBot';
      this.typingBotName.textContent = config.botName || 'NexaBot';
      this.contactUrl = config.contactUrl || 'https://t.me/dev_hridoy';
    } catch (error) {
      console.error('Error loading bot config:', error);
      this.botNameElement.textContent = 'NexaBot';
      this.botAvatarElement.src = 'https://via.placeholder.com/40';
      this.botMessageAuthor.textContent = 'NexaBot';
      this.typingBotName.textContent = 'NexaBot';
      this.contactUrl = 'https://t.me/dev_hridoy';
    }
  }

  async loadCommands() {
    try {
      const response = await fetch('/api/commands');
      const commands = await response.json();
      console.log('Available commands:', commands);
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  }

  async updateUsername() {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-User-UID': this.uid },
      });
      const user = await response.json();
      this.usernameDisplay.textContent = user.name || 'Unknown User';
    } catch (error) {
      console.error('Error fetching username:', error);
      this.usernameDisplay.textContent = 'Unknown User';
    }
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'You', 'U', null, null);
    this.chatInput.value = '';
    this.autoResizeTextarea();

    this.showTyping();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, uid: this.uid }),
      });
      const result = await response.json();
      this.hideTyping();
      this.addMessage(result.text || 'No response', this.botNameElement.textContent, 'N', result.image, result.audio);
    } catch (error) {
      this.hideTyping();
      this.addMessage('Error communicating with server', this.botNameElement.textContent, 'N', null, null);
      console.error(error);
    }
  }

  initThemeSystem() {
    const settingsButton = document.getElementById('settingsButton');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleSlider = themeToggle.querySelector('.theme-toggle-slider i');

    const savedTheme = localStorage.getItem('chatTheme') || 'dark';
    this.setTheme(savedTheme);

    settingsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!settingsButton.contains(e.target)) {
        settingsDropdown.classList.remove('open');
      }
    });

    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
      localStorage.setItem('chatTheme', newTheme);
    });

    document.getElementById('themeToggleItem').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  initProfileSystem() {
    const profileButton = document.getElementById('profileButton');
    const closeProfileModal = document.getElementById('closeProfileModal');

    profileButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showProfileModal();
    });

    closeProfileModal.addEventListener('click', () => {
      this.profileModal.classList.add('hidden');
    });

    this.profileModal.addEventListener('click', (e) => {
      if (e.target === this.profileModal) {
        this.profileModal.classList.add('hidden');
      }
    });
  }

  initContactSystem() {
    const contactButton = document.getElementById('contactButton');
    contactButton.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(this.contactUrl, '_blank');
    });
  }

  async showProfileModal() {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-User-UID': this.uid },
      });
      const user = await response.json();
      document.getElementById('profileUsername').textContent = user.name || 'Unknown';
      document.getElementById('profileUID').textContent = this.uid;
      document.getElementById('profileJoined').textContent = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : 'Unknown';
      this.profileModal.classList.remove('hidden');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      document.getElementById('profileUsername').textContent = 'Error';
      document.getElementById('profileUID').textContent = this.uid;
      document.getElementById('profileJoined').textContent = 'Error';
      this.profileModal.classList.remove('hidden');
    }
  }

  setTheme(theme) {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleSlider = themeToggle.querySelector('.theme-toggle-slider i');

    body.setAttribute('data-theme', theme);

    if (theme === 'light') {
      themeToggle.classList.add('light');
      themeToggleSlider.className = 'fas fa-sun';
    } else {
      themeToggle.classList.remove('light');
      themeToggleSlider.className = 'fas fa-moon';
    }

    body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      body.style.transition = '';
    }, 300);
  }

  addMessage(text, author, avatar, imageUrl, audioUrl) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    let mediaHtml = '';
    if (imageUrl) {
      const imageName = imageUrl.split('/').pop();
      mediaHtml = `
        <div class="image-container" onclick="this.closest('.bot-chat').openImageViewer('${imageUrl}')">
          <div class="image-preview">
            <img src="${imageUrl}" alt="${imageName}" style="max-width: 100%; max-height: 100px;">
          </div>
          <div class="image-info">
            <div>
              <div class="image-name">${imageName}</div>
              <div class="image-size">Unknown size</div>
            </div>
            <i class="fas fa-expand-alt text-gray-400"></i>
          </div>
        </div>
      `;
    } else if (audioUrl) {
      const audioId = `audio_${Date.now()}`;
      const audioName = audioUrl.split('/').pop();
      mediaHtml = `
        <div class="audio-player" id="audioPlayerContainer_${audioId}">
          <div class="audio-controls">
            <button class="play-button" onclick="this.closest('.bot-chat').toggleAudio('${audioId}')">
              <i class="fas fa-play"></i>
            </button>
          </div>
          <div class="audio-info">
            <div class="audio-title">${audioName}</div>
            <div class="audio-progress" id="audioProgress_${audioId}">
              <div class="audio-progress-bar" id="audioProgressBar_${audioId}"></div>
            </div>
            <div class="audio-duration" id="audioDuration_${audioId}">0:00 / 0:00</div>
          </div>
          <audio id="audioElement_${audioId}" preload="metadata">
            <source src="${audioUrl}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        </div>
      `;
    }

 
    const formattedText = text.replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-avatar">${avatar}</div>
        <div class="message-body">
          <div class="message-header">
            <span class="message-author">${this.escapeHtml(author)}</span>
            <span class="message-timestamp">Today at ${timestamp}</span>
          </div>
          <div class="message-text whitespace-pre-wrap">${formattedText}</div>
          ${mediaHtml}
        </div>
      </div>
    `;

    this.chatMessages.appendChild(messageDiv);
    if (audioUrl) {
      this.initAudioPlayer(audioId);
    }
    this.scrollToBottom();
  }

  initAudioPlayer(audioId) {
    const audioElement = document.getElementById(`audioElement_${audioId}`);
    const playButton = document.getElementById(`audioPlayerContainer_${audioId}`).querySelector('.play-button');
    const progressBar = document.getElementById(`audioProgressBar_${audioId}`);
    const durationDisplay = document.getElementById(`audioDuration_${audioId}`);

    audioElement.addEventListener('loadedmetadata', () => {
      const duration = this.formatTime(audioElement.duration);
      durationDisplay.textContent = `0:00 / ${duration}`;
    });

    audioElement.addEventListener('timeupdate', () => {
      const currentTime = this.formatTime(audioElement.currentTime);
      const duration = this.formatTime(audioElement.duration);
      const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      durationDisplay.textContent = `${currentTime} / ${duration}`;
    });

    audioElement.addEventListener('ended', () => {
      playButton.querySelector('i').className = 'fas fa-play';
      audioElement.currentTime = 0;
      progressBar.style.width = '0%';
    });
  }

  toggleAudio(audioId) {
    const audioElement = document.getElementById(`audioElement_${audioId}`);
    const playButton = document.getElementById(`audioPlayerContainer_${audioId}`).querySelector('.play-button i');
    if (audioElement.paused) {
      audioElement.play();
      playButton.className = 'fas fa-pause';
    } else {
      audioElement.pause();
      playButton.className = 'fas fa-play';
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  openImageViewer(imageUrl) {
    if (!this.imageViewer) {
      this.imageViewer = document.createElement('div');
      this.imageViewer.className = 'image-viewer';
      this.imageViewer.innerHTML = `
        <div class="image-viewer-content">
          <img src="" alt="Full-size image">
          <button class="close-button"><i class="fas fa-times"></i></button>
        </div>
      `;
      document.body.appendChild(this.imageViewer);
      this.imageViewer.querySelector('.close-button').addEventListener('click', () => {
        this.imageViewer.style.display = 'none';
      });
    }

    this.imageViewer.querySelector('img').src = imageUrl;
    this.imageViewer.style.display = 'flex';
  }

  showTyping() {
    this.typingIndicator.style.display = 'block';
    this.scrollToBottom();
  }

  hideTyping() {
    this.typingIndicator.style.display = 'none';
  }

  autoResizeTextarea() {
    this.chatInput.style.height = 'auto';
    this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 144) + 'px';
  }

  handleNavAction(item) {
    const text = item.textContent.trim();
    if (text.includes('Logout')) {
      if (window.confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('uid');
        window.location.href = '/auth';
      }
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 50);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BotChat();
});

window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(10px)';

  setTimeout(() => {
    document.body.style.transition = 'all 0.5s ease-out';
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  }, 100);
});