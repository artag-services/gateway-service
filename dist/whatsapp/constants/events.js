"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_STRUCTURES = exports.EVENT_TYPE_MAP = exports.WhatsappEventType = void 0;
var WhatsappEventType;
(function (WhatsappEventType) {
    WhatsappEventType["MESSAGE"] = "messages";
    WhatsappEventType["MESSAGE_ECHO"] = "smb_message_echoes";
    WhatsappEventType["CALLS"] = "calls";
    WhatsappEventType["FLOWS"] = "flows";
    WhatsappEventType["PHONE_NUMBER_UPDATE"] = "phone_number_name_update";
    WhatsappEventType["TEMPLATE_UPDATE"] = "message_template_components_update";
    WhatsappEventType["ACCOUNT_ALERTS"] = "account_alerts";
})(WhatsappEventType || (exports.WhatsappEventType = WhatsappEventType = {}));
exports.EVENT_TYPE_MAP = {
    'messages': WhatsappEventType.MESSAGE,
    'smb_message_echoes': WhatsappEventType.MESSAGE_ECHO,
    'calls': WhatsappEventType.CALLS,
    'flows': WhatsappEventType.FLOWS,
    'phone_number_name_update': WhatsappEventType.PHONE_NUMBER_UPDATE,
    'message_template_components_update': WhatsappEventType.TEMPLATE_UPDATE,
    'account_alerts': WhatsappEventType.ACCOUNT_ALERTS,
};
exports.EVENT_STRUCTURES = {
    [WhatsappEventType.MESSAGE]: {
        description: 'Mensaje de texto, imagen o multimedia recibido de usuario',
        example: {
            field: 'messages',
            value: {
                messaging_product: 'whatsapp',
                metadata: {
                    display_phone_number: '16505551111',
                    phone_number_id: '123456123',
                },
                contacts: [
                    {
                        profile: {
                            name: 'test user name',
                        },
                        wa_id: '16315551181',
                        user_id: 'US.13491208655302741918',
                    },
                ],
                messages: [
                    {
                        id: 'ABGGFlA5Fpa',
                        timestamp: '1504902988',
                        from: '16315551181',
                        from_user_id: 'US.13491208655302741918',
                        type: 'text',
                        text: {
                            body: 'this is a text message',
                        },
                    },
                ],
            },
        },
    },
    [WhatsappEventType.MESSAGE_ECHO]: {
        description: 'Echo/confirmación de mensaje enviado por nosotros',
        example: {
            field: 'smb_message_echoes',
            value: {
                messaging_product: 'whatsapp',
                metadata: {
                    display_phone_number: '16505551111',
                    phone_number_id: '123456123',
                },
                message_echoes: [
                    {
                        from: '16315551181',
                        to: '11234567890',
                        id: 'ABGGFlA5Fpa',
                        timestamp: '1504902988',
                        type: 'text',
                        text: {
                            body: 'this is a text message',
                        },
                    },
                ],
            },
        },
    },
    [WhatsappEventType.CALLS]: {
        description: 'Evento de llamada de voz/video',
        example: {
            field: 'calls',
            value: {
                messaging_product: 'whatsapp',
                metadata: {
                    display_phone_number: '16505551111',
                    phone_number_id: '123456123',
                },
                calls: [
                    {
                        id: 'ABGGFlA5Fpa',
                        to: '18005551180',
                        from: '16315551181',
                        timestamp: 1504902988,
                        event: 'connect',
                    },
                ],
                contacts: [
                    {
                        profile: {
                            name: 'test user name',
                        },
                        wa_id: '16315551181',
                    },
                ],
            },
        },
    },
    [WhatsappEventType.FLOWS]: {
        description: 'Cambio de estado en un flow',
        example: {
            field: 'flows',
            value: {
                event: 'FLOW_STATUS_CHANGE',
                message: 'Flow {FlowName} changed status from DRAFT to PUBLISHED',
                flow_id: '1000',
            },
        },
    },
    [WhatsappEventType.PHONE_NUMBER_UPDATE]: {
        description: 'Actualización del estado del nombre verificado del número',
        example: {
            field: 'phone_number_name_update',
            value: {
                display_phone_number: '16505551111',
                decision: 'APPROVED',
                requested_verified_name: 'WhatsApp',
                rejection_reason: null,
            },
        },
    },
    [WhatsappEventType.TEMPLATE_UPDATE]: {
        description: 'Actualización en componentes de plantilla de mensaje',
        example: {
            field: 'message_template_components_update',
            value: {
                message_template_id: 12345678,
                message_template_name: 'my_message_template',
                message_template_language: 'en-US',
                message_template_title: 'message header',
                message_template_element: 'message body',
                message_template_footer: 'message footer',
                message_template_buttons: [
                    {
                        message_template_button_type: 'URL',
                        message_template_button_text: 'button text',
                        message_template_button_url: 'https://example.com',
                        message_template_button_phone_number: '12342342345',
                    },
                ],
            },
        },
    },
    [WhatsappEventType.ACCOUNT_ALERTS]: {
        description: 'Alertas a nivel de cuenta/WABA',
        example: {
            field: 'account_alerts',
            value: {
                entity_type: 'WABA',
                entity_id: 123456,
                alert_severity: 'INFORMATIONAL',
                alert_status: 'NONE',
                alert_type: 'OBA_APPROVED',
                alert_description: 'Sample alert description',
            },
        },
    },
};
//# sourceMappingURL=events.js.map