declare const SUPPORTED_CHANNELS: readonly ["whatsapp", "instagram", "slack", "notion", "tiktok", "facebook"];
export type Channel = (typeof SUPPORTED_CHANNELS)[number];
export declare class SendMessageDto {
    channel: Channel;
    recipients: string[];
    message: string;
    operation?: string;
    mediaUrl?: string;
    metadata?: Record<string, unknown>;
}
export {};
