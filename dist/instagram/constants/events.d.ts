export declare enum InstagramEventType {
    MESSAGE = "messages",
    COMMENT = "comments",
    MESSAGE_REACTION = "message_reactions",
    MESSAGING_SEEN = "messaging_seen",
    MESSAGING_REFERRAL = "messaging_referral",
    MESSAGING_OPTINS = "messaging_optins",
    MESSAGING_HANDOVER = "messaging_handover"
}
export interface InstagramEventPayload {
    eventType: InstagramEventType;
    entryTime: number;
    value: any;
}
export declare const EVENT_TYPE_MAP: Record<string, InstagramEventType>;
export declare const EVENT_STRUCTURES: {
    messages: {
        description: string;
        example: {
            field: string;
            value: {
                sender: {
                    id: string;
                };
                recipient: {
                    id: string;
                };
                timestamp: string;
                message: {
                    mid: string;
                    text: string;
                    attachments: never[];
                };
            };
        };
    };
    comments: {
        description: string;
        example: {
            field: string;
            value: {
                from: {
                    id: string;
                    username: string;
                };
                media: {
                    id: string;
                    media_product_type: string;
                };
                id: string;
                parent_id: string;
                text: string;
            };
        };
    };
    message_reactions: {
        description: string;
        example: {
            field: string;
            value: {
                sender: {
                    id: string;
                };
                recipient: {
                    id: string;
                };
                timestamp: number;
                reaction: {
                    mid: string;
                    action: string;
                    reaction: string;
                    emoji: string;
                };
            };
        };
    };
    messaging_seen: {
        description: string;
        example: {
            field: string;
            value: {
                sender: {
                    id: string;
                };
                recipient: {
                    id: string;
                };
                timestamp: string;
                read: {
                    mid: string;
                };
            };
        };
    };
    messaging_referral: {
        description: string;
        example: {
            field: string;
            value: {
                sender: {
                    id: string;
                };
                recipient: {
                    id: string;
                };
                timestamp: number;
                referral: {
                    ref: string;
                    source: string;
                    type: string;
                };
            };
        };
    };
    messaging_optins: {
        description: string;
        example: {
            field: string;
            value: {
                sender: {
                    id: string;
                };
                recipient: {
                    id: string;
                };
                timestamp: string;
                optin: {
                    type: string;
                    payload: string;
                    notification_messages_token: string;
                    notification_messages_frequency: string;
                    token_expiry_timestamp: number;
                    user_token_status: string;
                    notification_messages_timezone: string;
                    title: string;
                };
            };
        };
    };
    messaging_handover: {
        description: string;
        example: {
            field: string;
            value: {
                sender: {
                    id: string;
                };
                recipient: {
                    id: string;
                };
                timestamp: number;
                pass_thread_control: {
                    previous_owner_app_id: string;
                    new_owner_app_id: string;
                    metadata: string;
                };
            };
        };
    };
};
