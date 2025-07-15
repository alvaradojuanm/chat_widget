from odoo import http
from odoo.http import request
import json
import uuid

class ChatController(http.Controller):
    
    @http.route('/chat/config', type='json', auth='public', methods=['POST'])
    def get_chat_config(self):
        """Get chat configuration for frontend"""
        config = request.env['chat.config'].sudo().get_chat_config()
        return {
            'active': config.is_active,
            'title': config.chat_title,
            'subtitle': config.chat_subtitle,
            'welcome_message': config.welcome_message,
            'button_color': config.button_color,
            'header_color': config.header_color,
        }
    
    @http.route('/chat/send', type='json', auth='public', methods=['POST'])
    def send_message(self, **kwargs):
        """Send message to webhook"""
        message = kwargs.get('message')
        session_id = kwargs.get('session_id')
        
        if not message or not session_id:
            return {'error': 'Message and session_id are required'}
        
        # Send message to webhook
        result = request.env['chat.message'].sudo().send_message_to_webhook(
            message=message,
            session_id=session_id
        )
        
        return result
    
    @http.route('/chat/upload', type='http', auth='public', methods=['POST'])
    def upload_file(self, **kwargs):
        """Handle file upload"""
        session_id = kwargs.get('session_id')
        uploaded_file = kwargs.get('file')
        
        if not uploaded_file:
            return json.dumps({'error': 'No file uploaded'})
        
        try:
            # Create attachment
            attachment = request.env['ir.attachment'].sudo().create({
                'name': uploaded_file.filename,
                'datas': uploaded_file.read(),
                'res_model': 'chat.message',
                'public': True,
            })
            
            return json.dumps({
                'success': True,
                'attachment_id': attachment.id,
                'filename': attachment.name,
                'url': f'/web/content/{attachment.id}'
            })
            
        except Exception as e:
            return json.dumps({'error': str(e)})