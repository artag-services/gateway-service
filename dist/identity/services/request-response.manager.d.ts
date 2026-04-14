export declare class RequestResponseManager {
    private readonly logger;
    private pendingRequests;
    private readonly REQUEST_TIMEOUT;
    createRequest(): {
        correlationId: string;
        promise: Promise<any>;
    };
    resolveResponse(correlationId: string, data: any): void;
    rejectResponse(correlationId: string, error: string): void;
    getPendingCount(): number;
    cleanup(): void;
}
