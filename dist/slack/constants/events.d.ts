export declare enum SLACK_EVENT_TYPES {
    MESSAGE_CHANNELS = "message.channels",
    MESSAGE_GROUPS = "message.groups",
    MESSAGE_IM = "message.im",
    MESSAGE_MPIM = "message.mpim",
    APP_MENTION = "app_mention",
    CHANNEL_CREATED = "channel_created",
    CHANNEL_DELETED = "channel_deleted",
    CHANNEL_RENAMED = "channel_renamed",
    MEMBER_JOINED_CHANNEL = "member_joined_channel",
    REACTION_ADDED = "reaction_added",
    REACTION_REMOVED = "reaction_removed",
    USER_CHANGE = "user_change",
    TEAM_JOIN = "team_join",
    FILE_CREATED = "file_created",
    FILE_DELETED = "file_deleted"
}
export declare const EVENT_TYPE_MAP: Record<SLACK_EVENT_TYPES, string>;
export declare const EVENT_DESCRIPTIONS: Record<SLACK_EVENT_TYPES, string>;
