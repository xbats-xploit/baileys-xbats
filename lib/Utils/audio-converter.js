"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAudioToOpus = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
/**
 * Convert audio to Opus OGG format for WhatsApp voice notes
 * Requires ffmpeg to be installed on the system
 */
const convertAudioToOpus = async (media, logger) => {
    const tempInput = (0, path_1.join)((0, os_1.tmpdir)(), `audio-input-${Date.now()}.tmp`);
    const tempOutput = (0, path_1.join)((0, os_1.tmpdir)(), `audio-output-${Date.now()}.ogg`);
    try {
        // Write input to temp file
        if (Buffer.isBuffer(media)) {
            await fs_1.promises.writeFile(tempInput, media);
        }
        else if (typeof media === 'string') {
            // If it's a file path, copy it
            await fs_1.promises.copyFile(media, tempInput);
        }
        else {
            throw new Error('Unsupported media type for audio conversion');
        }
        // Convert using ffmpeg
        await new Promise((resolve, reject) => {
            const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
                '-i', tempInput,
                '-c:a', 'libopus',
                '-b:a', '128k',
                '-vbr', 'on',
                '-compression_level', '10',
                '-frame_duration', '60',
                '-application', 'voip',
                '-y',
                tempOutput
            ]);
            let stderr = '';
            ffmpeg.stderr.on('data', chunk => {
                stderr += chunk.toString();
            });
            ffmpeg.on('error', err => {
                reject(new Error(`ffmpeg spawn error: ${err.message}`));
            });
            ffmpeg.on('close', code => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`));
                }
            });
        });
        // Read converted file
        const converted = await fs_1.promises.readFile(tempOutput);
        // Cleanup
        await fs_1.promises.unlink(tempInput).catch(() => { });
        await fs_1.promises.unlink(tempOutput).catch(() => { });
        logger?.debug('Audio converted to Opus OGG for PTT');
        return converted;
    }
    catch (error) {
        // Cleanup on error
        await fs_1.promises.unlink(tempInput).catch(() => { });
        await fs_1.promises.unlink(tempOutput).catch(() => { });
        logger?.warn({ error }, 'Failed to convert audio to Opus, sending as-is');
        // Fallback: return original media if conversion fails
        if (Buffer.isBuffer(media)) {
            return media;
        }
        else if (typeof media === 'string') {
            return await fs_1.promises.readFile(media);
        }
        throw error;
    }
};
exports.convertAudioToOpus = convertAudioToOpus;
//# sourceMappingURL=audio-converter.js.map