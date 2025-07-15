/** Chat Widget JS compatible con Odoo 18 */
odoo.define('chat_widget.frontend', function(require) {
    'use strict';

    const rpc = require('web.rpc');

    class ChatWidget {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.isOpen = false;
            this.config = {};
            document.addEventListener('DOMContentLoaded', this.init.bind(this));
        }

        generateSessionId() {
            return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        async init() {
            await this.loadConfig();
            if (this.config.active) {
                this.applyConfig();
                this.setupEventListeners();
                this.updateTime();
                setInterval(this.updateTime.bind(this), 60000);
            } else {
                this.hideWidget();
            }
        }

        async loadConfig() {
            try {
                const res = await rpc.query({
                    model: 'chat.config',
                    method: 'search_read',
                    args: [[['is_active', '=', true]], [
                        'chat_title',
                        'chat_subtitle',
                        'welcome_message',
                        'button_color',
                        'header_color',
                    ]],
                    limit: 1,
                });
                if (res.length > 0) {
                    const r = res[0];
                    this.config = {
                        active: true,
                        title: r.chat_title,
                        subtitle: r.chat_subtitle,
                        welcome_message: r.welcome_message,
                        button_color: r.button_color,
                        header_color: r.header_color,
                    };
                } else {
                    this.config = { active: false };
                }
            } catch (e) {
                console.error('Chat config RPC failure', e);
                this.config = { active: false };
            }
        }

        applyConfig() {
            const setText = (id, text) => {
                const el = document.getElementById(id);
                if (el && text != null) el.textContent = text;
            };
            setText('chat-title', this.config.title);
            setText('chat-subtitle', this.config.subtitle);
            setText('welcome-message', this.config.welcome_message);

            const btn = document.getElementById('chat-button');
            const hdr = document.querySelector('.chat-header');
            if (btn && this.config.button_color) {
                btn.style.background = this.config.button_color;
            }
            if (hdr && this.config.header_color) {
                hdr.style.background = this.config.header_color;
            }
        }

        setupEventListeners() {
            const btn = document.getElementById('chat-button');
            const closeBtn = document.getElementById('chat-close');
            if (btn) btn.addEventListener('click', this.toggleChat.bind(this));
            if (closeBtn) closeBtn.addEventListener('click', this.closeChat.bind(this));
        }

        toggleChat() {
            const win = document.getElementById('chat-window');
            if (!win) return;
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            const win = document.getElementById('chat-window');
            if (win) {
                win.classList.remove('hidden');
                this.isOpen = true;
                const inp = document.getElementById('chat-input');
                if (inp) inp.focus();
            }
        }

        closeChat() {
            const win = document.getElementById('chat-window');
            if (win) {
                win.classList.add('hidden');
                this.isOpen = false;
            }
        }

        updateTime() {
            const mt = document.getElementById('message-time');
            if (mt) {
                mt.textContent = new Date().toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
            }
        }

        hideWidget() {
            const ctr = document.getElementById('chat-widget-container');
            if (ctr) ctr.style.display = 'none';
        }
    }

    new ChatWidget();
});
