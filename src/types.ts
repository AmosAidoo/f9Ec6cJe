export interface Comment {
	id: number
	text: string
	parentId: number | null
	createdAt: Date

	delete: () => Promise<void>
	reply: (text: string) => Promise<Comment | undefined>
}