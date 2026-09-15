import { proto } from '../../WAProto/index.js'

export interface AIMessageOptions {
	generated?: boolean
	model?: string
	personaId?: string
	invokerJid?: string
}

/**
 * Attaches AI metadata context (botMetadata) to a message proto
 */
export function attachAIMetadata(message: proto.IMessage, options: AIMessageOptions): proto.IMessage {
	if (!message.messageContextInfo) {
		message.messageContextInfo = {}
	}

	message.messageContextInfo.botMetadata = {
		personaId: options.personaId || 'xbats-ai',
		invokerJid: options.invokerJid,
		modelMetadata: options.model ? { modelName: options.model } as any : undefined
	}

	return message
}
