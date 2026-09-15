import { createCanvas } from 'canvas'
import type { TableRenderOptions } from './table-render'
import { renderTableToImage } from './table-render'

/**
 * Renders structured HTML-like template or structured blocks into a sendable image buffer.
 */
export async function renderHtmlCardToImage(title: string, contentLines: string[], footer?: string): Promise<Buffer> {
	const width = 600
	const padding = 25
	const lineHeight = 28
	const height = Math.max(250, (contentLines.length * lineHeight) + 120)

	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	// Background
	ctx.fillStyle = '#1e1e2e'
	ctx.fillRect(0, 0, width, height)

	// Accent border top
	ctx.fillStyle = '#89b4fa'
	ctx.fillRect(0, 0, width, 6)

	// Title
	ctx.fillStyle = '#89b4fa'
	ctx.font = 'bold 18px sans-serif'
	ctx.fillText(title, padding, padding + 20)

	// Divider
	ctx.strokeStyle = '#313244'
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(padding, padding + 35)
	ctx.lineTo(width - padding, padding + 35)
	ctx.stroke()

	// Content Lines
	ctx.fillStyle = '#cdd6f4'
	ctx.font = '14px sans-serif'
	let currentY = padding + 70

	contentLines.forEach(line => {
		ctx.fillText(line, padding, currentY)
		currentY += lineHeight
	})

	// Footer
	if (footer) {
		ctx.fillStyle = '#6c7086'
		ctx.font = 'italic 12px sans-serif'
		ctx.fillText(footer, padding, height - 20)
	}

	return canvas.toBuffer('image/png')
}
