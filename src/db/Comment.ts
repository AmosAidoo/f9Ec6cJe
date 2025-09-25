import { Entity } from "dexie"
import type AppDB from "./AppDB"

export default class Comment extends Entity<AppDB> {
	id!: number
	text!: string
	parentId!: number
	createdAt!: Date

	async reply(text: string) {
		const id = await this.db.comments.add({
			text,
			parentId: this.id,
			createdAt: new Date()
		})
		return this.db.comments.get(id)
	}

	async delete() {
		const db = this.db
		await db.transaction("rw", db.comments, async () => {
			const deleteAllComments = async (commentId: number) => {
				await db.comments.delete(commentId)
				const replies = await db.comments.where("parentId").equals(commentId).toArray()
				for (const reply of replies) {
					await deleteAllComments(reply.id)
				}
			}
			await deleteAllComments(this.id)
		})
	}
}