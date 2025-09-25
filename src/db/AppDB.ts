import Dexie, { type EntityTable } from "dexie"
import Comment from "./Comment"

export default class AppDB extends Dexie {
	comments!: EntityTable<Comment, "id">

	constructor() {
		super("CommentsDB")
		this.version(1).stores({
			comments: "++id, parentId, createdAt"
		})
		this.comments.mapToClass(Comment)
	}

	async addRootComment(text: string) {
		// Root comments always have a parent id of -1
		const id = await this.comments.add({
			parentId: -1,
			text: text,
			createdAt: new Date(),
		})
		return this.comments.get(id)
	}
}
