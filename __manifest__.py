# __manifest__.py
{
    'name': 'Chat Widget with Webhook',
    'version': '18.0.1.0.0',
    'category': 'Website',
    'summary': 'Chat widget with webhook integration',
    'description': """
Chat Widget with Webhook Integration
===================================
This module provides:
* Chat widget button on website
* Popup chat window
* Webhook integration
* Admin config panel
* Enable/disable functionality
* File attachment support
""",
    'author': 'dployxperts',
    'website': 'https://dployxperts.com/',
    'depends': ['base', 'website', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/chat_config_views.xml',
        'views/website_templates.xml',
        'data/chat_config_data.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'chat_widget/static/src/css/chat_widget.css',
            'chat_widget/static/src/js/chat_widget.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
