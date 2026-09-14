import { spawn } from 'child_process'
import { createReadStream, createWriteStream, promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import type { ILogger } from './logger'

/**
 * Convert audio to Opus OGG format for WhatsApp voice notes
 * Requires ffmpeg to be installed on the system
 */
export const convertAudioToOpus = async (
	media: Buffer | string,
	logger?: ILogger
): Promise<Buffer> => {
	const tempInput = join(tmpdir(), `audio-input-${Date.now()}.tmp`)
	const tempOutput = join(tmpdir(), `audio-output-${Date.now()}.ogg`)

	try {
		// Write input to temp file
		if (Buffer.isBuffer(media)) {
			await fs.writeFile(tempInput, media)
		} else if (typeof media === 'string') {
			// If it's a file path, copy it
			await fs.copyFile(media, tempInput)
		} else {
			throw new Error('Unsupported media type for audio conversion')
		}

		// Convert using ffmpeg
		await new Promise<void>((resolve, reject) => {
			const ffmpeg = spawn('ffmpeg', [
				'-i', tempInput,
				'-c:a', 'libopus',
				'-b:a', '128k',
				'-vbr', 'on',
				'-compression_level', '10',
				'-frame_duration', '60',
				'-application', 'voip',
				'-y',
				tempOutput
			])

			let stderr = ''
			ffmpeg.stderr.on('data', chunk => {
				stderr += chunk.toString()
			})

			ffmpeg.on('error', err => {
				reject(new Error(`ffmpeg spawn error: ${err.message}`))
			})

			ffmpeg.on('close', code => {
				if (code === 0) {
					resolve()
				} else {
					reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`))
				}
			})
		})

		// Read converted file
		const converted = await fs.readFile(tempOutput)
		
		// Cleanup
		await fs.unlink(tempInput).catch(() => {})
		await fs.unlink(tempOutput).catch(() => {})

		logger?.debug('Audio converted to Opus OGG for PTT')
		return converted
	} catch (error) {
		// Cleanup on error
		await fs.unlink(tempInput).catch(() => {})
		await fs.unlink(tempOutput).catch(() => {})
		
		logger?.warn({ error }, 'Failed to convert audio to Opus, sending as-is')
		
		// Fallback: return original media if conversion fails
		if (Buffer.isBuffer(media)) {
			return media
		} else if (typeof media === 'string') {
			return await fs.readFile(media)
		}
		
		throw error
	}
}
