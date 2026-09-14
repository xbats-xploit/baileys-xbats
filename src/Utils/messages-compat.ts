import { proto } from '../../WAProto/index.js'
import type { AnyMessageContent } from '../Types'

/**
 * Compatibility layer for legacy button formats
 * Converts old-style buttons/templateButtons to modern interactiveMessage
 */

export const convertLegacyButtons = (message: any, mediaMessage: any): any => {
	if (!('buttons' in message) && !('templateButtons' in message)) {
		return mediaMessage
	}

	const buttons = (message as any).buttons || (message as any).templateButtons || []
	
	// Build buttonsMessage for compatibility
	const buttonsMessage: any = {
		buttons: buttons.map((b: any) => ({
			buttonId: b.buttonId || b.id || '',
			buttonText: {
				displayText: b.buttonText?.displayText || b.displayText || ''
			},
			type: b.type || 1,
			nativeFlowInfo: b.nativeFlowInfo ? {
				name: b.nativeFlowInfo.name || '',
				paramsJson: b.nativeFlowInfo.paramsJson || ''
			} : undefined
		}))
	}

	if ('text' in message) {
		buttonsMessage.contentText = message.text
		buttonsMessage.headerType = 0 // EMPTY
	} else if ('caption' in message) {
		buttonsMessage.contentText = message.caption
		const mediaKey = Object.keys(mediaMessage)[0]
		if (mediaKey) {
			const headerTypeMap: any = {
				'imageMessage': 1,
				'documentMessage': 3,
				'videoMessage': 2,
				'locationMessage': 4
			}
			buttonsMessage.headerType = headerTypeMap[mediaKey] || 6
			Object.assign(buttonsMessage, mediaMessage)
		}
	}

	if ('title' in message && message.title) {
		buttonsMessage.text = message.title
		buttonsMessage.headerType = 5 // TEXT
	}

	if ('footer' in message && message.footer) {
		buttonsMessage.footerText = message.footer
	}

	if ('contextInfo' in message && message.contextInfo) {
		buttonsMessage.contextInfo = message.contextInfo
	}

	return { buttonsMessage: proto.Message.ButtonsMessage.create(buttonsMessage) }
}
