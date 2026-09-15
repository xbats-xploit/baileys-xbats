import { proto } from '../../WAProto/index.js'
import type { AnyMessageContent } from '../Types'

export interface InteractiveButtonRow {
	header?: string
	title: string
	description?: string
	id: string
}

export interface InteractiveButtonSection {
	title?: string
	highlight_label?: string
	rows: InteractiveButtonRow[]
}

export interface SingleSelectParams {
	title: string
	sections: InteractiveButtonSection[]
}

export interface NativeFlowButtonConfig {
	name: 'single_select' | 'quick_reply' | 'cta_url' | 'cta_call' | 'cta_copy' | 'cta_reminder' | 'cta_cancel_reminder' | 'address_message' | 'send_location' | string
	buttonParamsJson: string
}

export interface InteractiveMessageContent {
	text?: string
	caption?: string
	title?: string
	footer?: string
	header?: {
		title?: string
		subtitle?: string
		hasMediaAttachment?: boolean
		[key: string]: any
	}
	interactiveButtons?: NativeFlowButtonConfig[]
	buttons?: any[]
	templateButtons?: any[]
	sections?: InteractiveButtonSection[]
	buttonText?: string
	contextInfo?: proto.IContextInfo | null
}

/**
 * Normalizes various legacy and modern button input shapes into a modern InteractiveMessage
 */
export function normalizeToInteractiveMessage(content: any): proto.Message.IInteractiveMessage | null {
	if (!content || typeof content !== 'object') {
		return null
	}

	const nativeButtons: proto.Message.InteractiveMessage.NativeFlowMessage.INativeFlowButton[] = []

	// 1. First-class interactiveButtons
	if (Array.isArray(content.interactiveButtons)) {
		for (const btn of content.interactiveButtons) {
			nativeButtons.push({
				name: btn.name,
				buttonParamsJson: typeof btn.buttonParamsJson === 'string' ? btn.buttonParamsJson : JSON.stringify(btn.buttonParamsJson || {})
			})
		}
	}
	// 2. Legacy buttons with nativeFlowInfo (as used in case.js for .xmenu)
	else if (Array.isArray(content.buttons)) {
		for (const btn of content.buttons) {
			if (btn.nativeFlowInfo) {
				nativeButtons.push({
					name: btn.nativeFlowInfo.name,
					buttonParamsJson: typeof btn.nativeFlowInfo.paramsJson === 'string' 
						? btn.nativeFlowInfo.paramsJson 
						: JSON.stringify(btn.nativeFlowInfo.paramsJson || {})
				})
			} else if (btn.buttonId || btn.quickReplyButton) {
				const id = btn.buttonId || btn.quickReplyButton?.id || ''
				const displayText = btn.buttonText?.displayText || btn.quickReplyButton?.displayText || ''
				nativeButtons.push({
					name: 'quick_reply',
					buttonParamsJson: JSON.stringify({
						display_text: displayText,
						id: id
					})
				})
			}
		}
	}
	// 3. Legacy listMessage / sections (single_select equivalent)
	else if (Array.isArray(content.sections)) {
		const singleSelectParams: SingleSelectParams = {
			title: content.buttonText || content.title || 'Select Option',
			sections: content.sections.map((s: any) => ({
				title: s.title || '',
				highlight_label: s.highlight_label,
				rows: (s.rows || []).map((r: any) => ({
					header: r.header || '',
					title: r.title || '',
					description: r.description || '',
					id: r.rowId || r.id || ''
				}))
			}))
		}
		nativeButtons.push({
			name: 'single_select',
			buttonParamsJson: JSON.stringify(singleSelectParams)
		})
	}

	if (nativeButtons.length === 0) {
		return null
	}

	const bodyText = content.text || content.caption || content.body || ''
	const interactiveMsg: proto.Message.IInteractiveMessage = {
		body: {
			text: bodyText
		},
		footer: content.footer ? { text: content.footer } : undefined,
		header: content.title || content.header?.title ? {
			title: content.title || content.header?.title,
			subtitle: content.header?.subtitle,
			hasMediaAttachment: !!content.header?.hasMediaAttachment
		} : undefined,
		nativeFlowMessage: {
			buttons: nativeButtons,
			messageVersion: 3
		},
		contextInfo: content.contextInfo || undefined
	}

	return interactiveMsg
}
