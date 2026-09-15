import { createCanvas } from 'canvas'

export interface TableRow {
	[key: string]: any
}

export interface TableRenderOptions {
	title?: string
	columns: { header: string; key: string; width?: number }[]
	rows: TableRow[]
	footer?: string
}

/**
 * Renders structured JSON rows/columns into a clean PNG image buffer
 * for WhatsApp chats (Path B table rendering).
 */
export async function renderTableToImage(options: TableRenderOptions): Promise<Buffer> {
	const { title, columns, rows, footer } = options
	
	const colWidth = 180
	const rowHeight = 35
	const headerHeight = 50
	const titleHeight = title ? 40 : 0
	const footerHeight = footer ? 30 : 0
	const padding = 20

	const width = Math.max(600, columns.length * colWidth + padding * 2)
	const height = titleHeight + headerHeight + (rows.length * rowHeight) + footerHeight + (padding * 2)

	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	// Background
	ctx.fillStyle = '#1e1e2e'
	ctx.fillRect(0, 0, width, height)

	let currentY = padding

	// Draw Title
	if (title) {
		ctx.fillStyle = '#cba6f7'
		ctx.font = 'bold 20px sans-serif'
		ctx.fillText(title, padding, currentY + 25)
		currentY += titleHeight + 10
	}

	// Draw Header Background
	ctx.fillStyle = '#313244'
	ctx.fillRect(padding, currentY, width - (padding * 2), headerHeight)

	// Draw Header Text
	ctx.fillStyle = '#f5e0dc'
	ctx.font = 'bold 14px sans-serif'
	columns.forEach((col, idx) => {
		const x = padding + 15 + (idx * colWidth)
		ctx.fillText(col.header, x, currentY + 30)
	})

	currentY += headerHeight

	// Draw Rows
	rows.forEach((row, rowIndex) => {
		// Alternating row colors
		ctx.fillStyle = rowIndex % 2 === 0 ? '#11111b' : '#181825'
		ctx.fillRect(padding, currentY, width - (padding * 2), rowHeight)

		ctx.fillStyle = '#cdd6f4'
		ctx.font = '13px sans-serif'
		columns.forEach((col, colIdx) => {
			const x = padding + 15 + (colIdx * colWidth)
			const val = row[col.key] !== undefined ? String(row[col.key]) : ''
			ctx.fillText(val, x, currentY + 22)
		})

		currentY += rowHeight
	})

	// Draw Footer
	if (footer) {
		currentY += 10
		ctx.fillStyle = '#6c7086'
		ctx.font = 'italic 11px sans-serif'
		ctx.fillText(footer, padding, currentY + 15)
	}

	return canvas.toBuffer('image/png')
}
