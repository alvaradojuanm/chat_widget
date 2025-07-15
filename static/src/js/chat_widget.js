(function() {
    'use strict';

    class ChatWidget {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.isOpen = false;
            this.config = {};
            this.init();
        }

        generateSessionId() {
            return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        async init() {
            await this.loadConfig();
            if (this.config.active) {
                this.setupEventListeners();
                this.updateTime();
                setInterval(() => this.updateTime(), 60000); // Update every minute
            } else {
                this.hideWidget();
            }
        }

        async loadConfig() {
            try {
                const response = await fetch('/chat/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });
                
                this.config = await response.json();
                this.applyConfig();
            } catch (error) {
                console.error('Error loading chat config:', error);
                this.config = { active: false };
            }
        }

        applyConfig() {
            const chatTitle = document.getElementById('chat-title');
            const chatSubtitle = document.getElementById('chat-subtitle');
            const welcomeMessage = document.getElementById('welcome-message');
            const chatButton = document.getElementById('chat-button');
            const chatHeader = document.querySelector('.chat-header');

            if (chatTitle) chatTitle.textContent = this.config.title || 'Habla con nosotros';
            if (chatSubtitle) chatSubtitle.textContent = this.config.subtitle || '¿Cómo podemos ayudarte hoy?';
            if (welcomeMessage) welcomeMessage.textContent = this.config.welcome_message || 'Hola, puedo ayudarte con tus dudas en un Tap Tap';
            
            if (this.config.button_color && chatButton) {
                chatButton.style.background = this.config.button_color;
            }
            
            if (this.config.header_color && chatHeader) {
                chatHeader.style.background = this.config.header_color;
            }
        }

        setupEventListeners() {
            const chatButton = document.getElementById('chat-button');
            const chatWindow = document.getElementById('chat-window');
            const chatClose = document.getElementById('chat-close');
            const sendBtn = document.getElementById('send-btn');
            const chatInput = document.getElementById('chat-input');
            const attachBtn = document.getElementById('attach-btn');
            const fileInput = document.getElementById('file-input');

            if (chatButton) {
                chatButton.addEventListener('click', () => this.toggleChat());
            }

            if (chatClose) {
                chatClose.addEventListener('click', () => this.closeChat());
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', () => this.sendMessage());
            }

            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });
            }

            if (attachBtn) {
                attachBtn.addEventListener('click', () => {
                    fileInput.click();
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    this.handleFileUpload(e.target.files[0]);
                });
            }
        }

        toggleChat() {
            const chatWindow = document.getElementById('chat-window');
            if (chatWindow) {
                if (this.isOpen) {
                    this.closeChat();
                } else {
                    this.openChat();
                }
            }
        }

        openChat() {
            const chatWindow = document.getElementById('chat-window');
            if (chatWindow) {
                chatWindow.classList.remove('hidden');
                this.isOpen = true;
                
                // Focus on input
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    setTimeout(() => chatInput.focus(), 300);
                }
            }
        }

        closeChat() {
            const chatWindow = document.getElementById('chat-window');
            if (chatWindow) {
                chatWindow.classList.add('hidden');
                this.isOpen = false;
            }
        }

        async sendMessage() {
            const chatInput = document.getElementById('chat-input');
            const sendBtn = document.getElementById('send-btn');
            
            if (!chatInput || !sendBtn) return;
            
            const message = chatInput.value.trim();
            if (!message) return;

            // Disable input and button
            chatInput.disabled = true;
            sendBtn.disabled = true;
            
            // Add user message to chat
            this.addMessage(message, true);
            
            // Clear input
            chatInput.value = '';
            
            // Show typing indicator
            this.showTypingIndicator();
            
            try {
                const response = await fetch('/chat/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        session_id: this.sessionId
                    })
                });
                
                const result = await response.json();
                
                // Remove typing indicator
                this.hideTypingIndicator();
                
                if (result.success) {
                    this.addMessage(result.response, false);
                } else {
                    this.addMessage('Lo siento, hubo un error. Intenta nuevamente.', false);
                }
                
            } catch (error) {
                console.error('Error sending message:', error);
                this.hideTypingIndicator();
                this.addMessage('Error de conexión. Intenta nuevamente.', false);
            }
            
            // Re-enable input and button
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }

        addMessage(message, isUser) {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
            
            const currentTime = new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-icon">${isUser ? '👤' : '🤖'}</div>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(message)}</div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        showTypingIndicator() {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return;

            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message bot-message';
            typingDiv.id = 'typing-indicator';
            
            typingDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-icon">🤖</div>
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;

            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        hideTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        async handleFileUpload(file) {
            if (!file) return;

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.addMessage('El archivo es demasiado grande. Máximo 5MB.', false);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('session_id', this.sessionId);

            try {
                const response = await fetch('/chat/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    this.addMessage(`📎 Archivo enviado: ${result.filename}`, true);
                    this.addMessage('Archivo recibido correctamente.', false);
                } else {
                    this.addMessage('Error al subir el archivo.', false);
                }

            } catch (error) {
                console.error('Error uploading file:', error);
                this.addMessage('Error al subir el archivo.', false);
            }
        }

        updateTime() {
            const messageTime = document.getElementById('message-time');
            if (messageTime) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
                messageTime.textContent = timeString;
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        hideWidget() {
            const container = document.getElementById('chat-widget-container');
            if (container) {
                container.style.display = 'none';
            }
        }
    }

    // Initialize chat widget when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        new ChatWidget();
    });

})();

# ===========================================
