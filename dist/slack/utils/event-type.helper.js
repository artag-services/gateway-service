"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlackEventType = getSlackEventType;
function getSlackEventType(event) {
    const baseType = event['type'];
    if (baseType === 'message') {
        const channel = event['channel'];
        const subtype = event['subtype'];
        if (!channel) {
            return 'message.channels';
        }
        if (channel.startsWith('C')) {
            return 'message.channels';
        }
        else if (channel.startsWith('G')) {
            return 'message.groups';
        }
        else if (channel.startsWith('D')) {
            return 'message.im';
        }
        else if (channel.startsWith('M')) {
            return 'message.mpim';
        }
        return 'message.channels';
    }
    return baseType;
}
//# sourceMappingURL=event-type.helper.js.map