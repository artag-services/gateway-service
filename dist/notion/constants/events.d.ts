export declare enum NotionEventType {
    PAGE_CREATED = "page.created",
    PAGE_CONTENT_UPDATED = "page.content_updated",
    PAGE_PROPERTIES_UPDATED = "page.properties_updated",
    PAGE_MOVED = "page.moved",
    PAGE_DELETED = "page.deleted",
    PAGE_UNDELETED = "page.undeleted",
    PAGE_LOCKED = "page.locked",
    PAGE_UNLOCKED = "page.unlocked",
    DATABASE_CREATED = "database.created",
    DATA_SOURCE_CREATED = "data_source.created",
    DATA_SOURCE_CONTENT_UPDATED = "data_source.content_updated",
    DATA_SOURCE_MOVED = "data_source.moved",
    DATA_SOURCE_DELETED = "data_source.deleted",
    DATA_SOURCE_UNDELETED = "data_source.undeleted",
    DATA_SOURCE_SCHEMA_UPDATED = "data_source.schema_updated",
    COMMENT_CREATED = "comment.created",
    COMMENT_UPDATED = "comment.updated",
    COMMENT_DELETED = "comment.deleted"
}
export interface NotionEventPayload {
    eventType: NotionEventType;
    timestamp: string;
    workspaceId: string;
    subscriptionId: string;
    integrationId: string;
    authors: Array<{
        user: {
            id: string;
            type: 'user' | 'bot';
        };
    }>;
    accessibleBy: {
        user: {
            id: string;
            type: 'user' | 'bot';
        };
    };
    attemptNumber: number;
    entity: 'user' | 'page' | 'database' | 'block' | 'comment' | 'data_source';
    data: any;
}
export declare const EVENT_TYPE_MAP: Record<string, NotionEventType>;
export declare const EVENT_STRUCTURES: {
    "page.created": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "page.content_updated": {
        description: string;
        entity: string;
        aggregated: boolean;
        note: string;
    };
    "page.properties_updated": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "page.moved": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "page.deleted": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "page.undeleted": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "page.locked": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "page.unlocked": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "database.created": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "data_source.created": {
        description: string;
        entity: string;
        aggregated: boolean;
        note: string;
    };
    "data_source.content_updated": {
        description: string;
        entity: string;
        aggregated: boolean;
        note: string;
    };
    "data_source.moved": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "data_source.deleted": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "data_source.undeleted": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "data_source.schema_updated": {
        description: string;
        entity: string;
        aggregated: boolean;
        note: string;
    };
    "comment.created": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "comment.updated": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
    "comment.deleted": {
        description: string;
        entity: string;
        aggregated: boolean;
    };
};
