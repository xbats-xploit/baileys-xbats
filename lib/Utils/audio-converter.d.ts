import type { ILogger } from './logger';
/**
 * Convert audio to Opus OGG format for WhatsApp voice notes
 * Requires ffmpeg to be installed on the system
 */
export declare const convertAudioToOpus: (media: Buffer | string, logger?: ILogger) => Promise<Buffer>;
//# sourceMappingURL=audio-converter.d.ts.map