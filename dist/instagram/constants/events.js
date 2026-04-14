"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_STRUCTURES = exports.EVENT_TYPE_MAP = exports.InstagramEventType = void 0;
var InstagramEventType;
(function (InstagramEventType) {
    InstagramEventType["MESSAGE"] = "messages";
    InstagramEventType["COMMENT"] = "comments";
    InstagramEventType["MESSAGE_REACTION"] = "message_reactions";
    InstagramEventType["MESSAGING_SEEN"] = "messaging_seen";
    InstagramEventType["MESSAGING_REFERRAL"] = "messaging_referral";
    InstagramEventType["MESSAGING_OPTINS"] = "messaging_optins";
    InstagramEventType["MESSAGING_HANDOVER"] = "messaging_handover";
})(InstagramEventType || (exports.InstagramEventType = InstagramEventType = {}));
exports.EVENT_TYPE_MAP = {
    'messages': InstagramEventType.MESSAGE,
    'comments': InstagramEventType.COMMENT,
    'message_reactions': InstagramEventType.MESSAGE_REACTION,
    'messaging_seen': InstagramEventType.MESSAGING_SEEN,
    'messaging_referral': InstagramEventType.MESSAGING_REFERRAL,
    'messaging_optins': InstagramEventType.MESSAGING_OPTINS,
    'messaging_handover': InstagramEventType.MESSAGING_HANDOVER,
};
exports.EVENT_STRUCTURES = {
    [InstagramEventType.MESSAGE]: {
        description: 'Mensaje directo recibido',
        example: {
            field: 'messages',
            value: {
                sender: { id: '915948254650361' },
                recipient: { id: '17841472713425441' },
                timestamp: '1527459824',
                message: {
                    mid: 'aWdfZAG1faXRlbTo...',
                    text: 'Hola!',
                    attachments: []
                }
            }
        }
    },
    [InstagramEventType.COMMENT]: {
        description: 'Comentario en un post o reel',
        example: {
            field: 'comments',
            value: {
                from: { id: '232323232', username: 'test' },
                media: { id: '123123123', media_product_type: 'FEED' },
                id: '17865799348089039',
                parent_id: '1231231234',
                text: 'This is an example.'
            }
        }
    },
    [InstagramEventType.MESSAGE_REACTION]: {
        description: 'Reacción a un mensaje directo',
        example: {
            field: 'message_reactions',
            value: {
                sender: { id: '12334' },
                recipient: { id: '23245' },
                timestamp: 233445667,
                reaction: {
                    mid: 'random_mid',
                    action: 'react',
                    reaction: 'love',
                    emoji: '❤️'
                }
            }
        }
    },
    [InstagramEventType.MESSAGING_SEEN]: {
        description: 'Confirmación de lectura de mensaje',
        example: {
            field: 'messaging_seen',
            value: {
                sender: { id: '12334' },
                recipient: { id: '23245' },
                timestamp: '1527459824',
                read: { mid: 'last_message_id_read' }
            }
        }
    },
    [InstagramEventType.MESSAGING_REFERRAL]: {
        description: 'Referral - usuario abrió thread desde link',
        example: {
            field: 'messaging_referral',
            value: {
                sender: { id: '2494432963985342' },
                recipient: { id: '90010195674710' },
                timestamp: 233445667,
                referral: {
                    ref: 'this_is_a_sample_ref_param',
                    source: 'SHORTLINK',
                    type: 'OPEN_THREAD'
                }
            }
        }
    },
    [InstagramEventType.MESSAGING_OPTINS]: {
        description: 'Opt-in de notificaciones de usuario',
        example: {
            field: 'messaging_optins',
            value: {
                sender: { id: '12334' },
                recipient: { id: '23245' },
                timestamp: '1527459824',
                optin: {
                    type: 'notification_messages',
                    payload: 'test_payload',
                    notification_messages_token: '123',
                    notification_messages_frequency: 'daily',
                    token_expiry_timestamp: 2592000000,
                    user_token_status: 'REFRESHED',
                    notification_messages_timezone: 'UTC',
                    title: 'testtopic'
                }
            }
        }
    },
    [InstagramEventType.MESSAGING_HANDOVER]: {
        description: 'Transferencia de control de thread a otra app',
        example: {
            field: 'messaging_handover',
            value: {
                sender: { id: '2494432963985342' },
                recipient: { id: '2494432963985342' },
                timestamp: 233445667,
                pass_thread_control: {
                    previous_owner_app_id: '777292979687735',
                    new_owner_app_id: '777292979687736',
                    metadata: 'testing'
                }
            }
        }
    }
};
//# sourceMappingURL=events.js.map