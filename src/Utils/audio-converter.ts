import { exec } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

/**
 * Converts any audio buffer to WhatsApp-compatible OGG/Opus PTT format using FFmpeg.
 */
export const convertAudioToPTT = async (buffer: Buffer | Uint8Array, ext: string = 'mp3'): Promise<Buffer> => {
	const tmpDir = tmpdir()
	const id = randomBytes(4).toString('hex')
	const inputPath = join(tmpDir, `input_${id}.${ext}`)
	const outputPath = join(tmpDir, `output_${id}.ogg`)

	await fs.writeFile(inputPath, buffer)

	return new Promise((resolve, reject) => {
		// FFmpeg command required for WhatsApp PTT compatibility
		// -c:a libopus : Use Opus codec
		// -ac 1 : Mono audio
		// -avoid_negative_ts make_zero : Fixes timeline issues in some players
		const command = `ffmpeg -i ${inputPath} -c:a libopus -ac 1 -avoid_negative_ts make_zero ${outputPath}`
		
		exec(command, async (err) => {
			try {
				if (err) {
					return reject(err)
				}
				const outputBuffer = await fs.readFile(outputPath)
				resolve(outputBuffer)
			} catch (e) {
				reject(e)
			} finally {
				// Cleanup temp files
				await fs.unlink(inputPath).catch(() => {})
				await fs.unlink(outputPath).catch(() => {})
			}
		})
	})
}
