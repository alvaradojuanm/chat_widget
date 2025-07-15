from odoo import models, fields, api

class ChatConfig(models.Model):
    _name = 'chat.config'
    _description = 'Chat Configuration'
    _rec_name = 'name'

    name = fields.Char(string='Configuration Name', required=True, default='Main Chat Config')
    webhook_url = fields.Char(string='Webhook URL', required=True, 
                             help='URL where chat messages will be sent')
    is_active = fields.Boolean(string='Active', default=True,
                              help='Enable/disable chat widget on website')
    welcome_message = fields.Text(string='Welcome Message', 
                                 default='¡Hola! ¿Cómo podemos ayudarte hoy?')
    chat_title = fields.Char(string='Chat Title', default='Habla con nosotros')
    chat_subtitle = fields.Char(string='Chat Subtitle', default='¿Cómo podemos ayudarte hoy?')
    button_color = fields.Char(string='Button Color', default='#007bff')
    header_color = fields.Char(string='Header Color', default='#007bff')
    
    @api.model
    def get_chat_config(self):
        """Get active chat configuration"""
        config = self.search([('is_active', '=', True)], limit=1)
        if not config:
            config = self.create({
                'name': 'Default Chat Config',
                'webhook_url': 'https://n8n.dployxperts.com/webhook-test/665d27c6-4c8f-476a-816c-14c45ea2bd5b<',
                'is_active': True,
            })
        return config
