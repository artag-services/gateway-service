export declare enum WhatsappEventType {
    MESSAGE = "messages",
    MESSAGE_ECHO = "smb_message_echoes",
    CALLS = "calls",
    FLOWS = "flows",
    PHONE_NUMBER_UPDATE = "phone_number_name_update",
    TEMPLATE_UPDATE = "message_template_components_update",
    ACCOUNT_ALERTS = "account_alerts"
}
export interface WhatsappEventPayload {
    eventType: WhatsappEventType;
    entryTime: number;
    value: any;
}
export declare const EVENT_TYPE_MAP: Record<string, WhatsappEventType>;
export declare const EVENT_STRUCTURES: {
    messages: {
        description: string;
        example: {
            field: string;
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts: {
                    profile: {
                        name: string;
                    };
                    wa_id: string;
                    user_id: string;
                }[];
                messages: {
                    id: string;
                    timestamp: string;
                    from: string;
                    from_user_id: string;
                    type: string;
                    text: {
                        body: string;
                    };
                }[];
            };
        };
    };
    smb_message_echoes: {
        description: string;
        example: {
            field: string;
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                message_echoes: {
                    from: string;
                    to: string;
                    id: string;
                    timestamp: string;
                    type: string;
                    text: {
                        body: string;
                    };
                }[];
            };
        };
    };
    calls: {
        description: string;
        example: {
            field: string;
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                calls: {
                    id: string;
                    to: string;
                    from: string;
                    timestamp: number;
                    event: string;
                }[];
                contacts: {
                    profile: {
                        name: string;
                    };
                    wa_id: string;
                }[];
            };
        };
    };
    flows: {
        description: string;
        example: {
            field: string;
            value: {
                event: string;
                message: string;
                flow_id: string;
            };
        };
    };
    phone_number_name_update: {
        description: string;
        example: {
            field: string;
            value: {
                display_phone_number: string;
                decision: string;
                requested_verified_name: string;
                rejection_reason: null;
            };
        };
    };
    message_template_components_update: {
        description: string;
        example: {
            field: string;
            value: {
                message_template_id: number;
                message_template_name: string;
                message_template_language: string;
                message_template_title: string;
                message_template_element: string;
                message_template_footer: string;
                message_template_buttons: {
                    message_template_button_type: string;
                    message_template_button_text: string;
                    message_template_button_url: string;
                    message_template_button_phone_number: string;
                }[];
            };
        };
    };
    account_alerts: {
        description: string;
        example: {
            field: string;
            value: {
                entity_type: string;
                entity_id: number;
                alert_severity: string;
                alert_status: string;
                alert_type: string;
                alert_description: string;
            };
        };
    };
};
