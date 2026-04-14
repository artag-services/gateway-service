"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_DESCRIPTIONS = exports.EVENT_TYPE_MAP = exports.SLACK_EVENT_TYPES = void 0;
var SLACK_EVENT_TYPES;
(function (SLACK_EVENT_TYPES) {
    SLACK_EVENT_TYPES["MESSAGE_CHANNELS"] = "message.channels";
    SLACK_EVENT_TYPES["MESSAGE_GROUPS"] = "message.groups";
    SLACK_EVENT_TYPES["MESSAGE_IM"] = "message.im";
    SLACK_EVENT_TYPES["MESSAGE_MPIM"] = "message.mpim";
    SLACK_EVENT_TYPES["APP_MENTION"] = "app_mention";
    SLACK_EVENT_TYPES["CHANNEL_CREATED"] = "channel_created";
    SLACK_EVENT_TYPES["CHANNEL_DELETED"] = "channel_deleted";
    SLACK_EVENT_TYPES["CHANNEL_RENAMED"] = "channel_renamed";
    SLACK_EVENT_TYPES["MEMBER_JOINED_CHANNEL"] = "member_joined_channel";
    SLACK_EVENT_TYPES["REACTION_ADDED"] = "reaction_added";
    SLACK_EVENT_TYPES["REACTION_REMOVED"] = "reaction_removed";
    SLACK_EVENT_TYPES["USER_CHANGE"] = "user_change";
    SLACK_EVENT_TYPES["TEAM_JOIN"] = "team_join";
    SLACK_EVENT_TYPES["FILE_CREATED"] = "file_created";
    SLACK_EVENT_TYPES["FILE_DELETED"] = "file_deleted";
})(SLACK_EVENT_TYPES || (exports.SLACK_EVENT_TYPES = SLACK_EVENT_TYPES = {}));
exports.EVENT_TYPE_MAP = {
    [SLACK_EVENT_TYPES.MESSAGE_CHANNELS]: 'slack.message.channels',
    [SLACK_EVENT_TYPES.MESSAGE_GROUPS]: 'slack.message.groups',
    [SLACK_EVENT_TYPES.MESSAGE_IM]: 'slack.message.im',
    [SLACK_EVENT_TYPES.MESSAGE_MPIM]: 'slack.message.mpim',
    [SLACK_EVENT_TYPES.APP_MENTION]: 'slack.app_mention',
    [SLACK_EVENT_TYPES.CHANNEL_CREATED]: 'slack.channel_created',
    [SLACK_EVENT_TYPES.CHANNEL_DELETED]: 'slack.channel_deleted',
    [SLACK_EVENT_TYPES.CHANNEL_RENAMED]: 'slack.channel_renamed',
    [SLACK_EVENT_TYPES.MEMBER_JOINED_CHANNEL]: 'slack.member_joined_channel',
    [SLACK_EVENT_TYPES.REACTION_ADDED]: 'slack.reaction_added',
    [SLACK_EVENT_TYPES.REACTION_REMOVED]: 'slack.reaction_removed',
    [SLACK_EVENT_TYPES.USER_CHANGE]: 'slack.user_change',
    [SLACK_EVENT_TYPES.TEAM_JOIN]: 'slack.team_join',
    [SLACK_EVENT_TYPES.FILE_CREATED]: 'slack.file_created',
    [SLACK_EVENT_TYPES.FILE_DELETED]: 'slack.file_deleted',
};
exports.EVENT_DESCRIPTIONS = {
    [SLACK_EVENT_TYPES.MESSAGE_CHANNELS]: 'A message was posted to a public channel the app is in',
    [SLACK_EVENT_TYPES.MESSAGE_GROUPS]: 'A message was posted to a private channel (group) the app is in',
    [SLACK_EVENT_TYPES.MESSAGE_IM]: 'A direct message was sent to the app',
    [SLACK_EVENT_TYPES.MESSAGE_MPIM]: 'A message was posted to a multi-user direct message channel the app is in',
    [SLACK_EVENT_TYPES.APP_MENTION]: 'The app was mentioned in a message',
    [SLACK_EVENT_TYPES.CHANNEL_CREATED]: 'A new public channel was created in the workspace',
    [SLACK_EVENT_TYPES.CHANNEL_DELETED]: 'A public channel was deleted',
    [SLACK_EVENT_TYPES.CHANNEL_RENAMED]: 'A public channel was renamed',
    [SLACK_EVENT_TYPES.MEMBER_JOINED_CHANNEL]: 'A user joined a public channel the app is in',
    [SLACK_EVENT_TYPES.REACTION_ADDED]: 'An emoji reaction was added to a message or file',
    [SLACK_EVENT_TYPES.REACTION_REMOVED]: 'An emoji reaction was removed from a message or file',
    [SLACK_EVENT_TYPES.USER_CHANGE]: 'A user changed their profile information',
    [SLACK_EVENT_TYPES.TEAM_JOIN]: 'A new user joined the workspace',
    [SLACK_EVENT_TYPES.FILE_CREATED]: 'A file was uploaded to the workspace',
    [SLACK_EVENT_TYPES.FILE_DELETED]: 'A file was deleted from the workspace',
};
//# sourceMappingURL=events.js.map