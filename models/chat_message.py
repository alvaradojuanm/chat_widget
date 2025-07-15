from odoo import models, fields, api
import requests
import json
from datetime import datetime

class ChatMessage(models.Model):
    _name = 'chat.message'
    _description = 'Chat Message'
    _order = 'create_date desc'

    session_id = fields.Char(string='Session ID', required=True)
    message = fields.Text(string='Message', required=True)
    is_user = fields.Boolean(string='Is User Message', default=True)
    response = fields.Text(string='Bot Response')
    attachment_ids = fields.Many2many('ir.attachment', string='Attachments')
    webhook_response = fields.Text(string='Webhook Response')
    state = fields.Selection([
        ('sent', 'Sent'),
        ('received', 'Received'),
        ('error', 'Error')
    ], string='Status', default='sent')

    @api.model
    def send_message_to_webhook(self, message, session_id, attachments=None):
        """Send message to configured webhook"""
        config = self.env['chat.config'].get_chat_config()
        
        if not config.webhook_url:
            return {'error': 'No webhook URL configured'}
        
        # Prepare message data
        message_data = {
            'message': message,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'attachments': attachments or []
        }
        
        # Create message record
        chat_message = self.create({
            'session_id': session_id,
            'message': message,
            'is_user': True,
            'state': 'sent'
        })
        
        try:
            # Send to webhook
            response = requests.post(
                config.webhook_url,
                json=message_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                bot_response = response_data.get('response', 'Mensaje recibido')
                
                # Update message with response
                chat_message.write({
                    'response': bot_response,
                    'webhook_response': response.text,
                    'state': 'received'
                })
                
                return {'success': True, 'response': bot_response}
            else:
                chat_message.write({
                    'state': 'error',
                    'webhook_response': f'Error {response.status_code}: {response.text}'
                })
                return {'error': f'Webhook error: {response.status_code}'}
                
        except Exception as e:
            chat_message.write({
                'state': 'error',
                'webhook_response': str(e)
            })
            return {'error': str(e)}

# ===========================================
