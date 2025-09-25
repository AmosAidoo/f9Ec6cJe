import { describe, it, expect, beforeEach } from "vitest"
import { db } from "../src/db/db"

describe("Comments Database layer", () => {
	beforeEach(async () => {
		await db.comments.clear()
	})

	it("creates a root comment with parentId = -1", async () => {
		const root = await db.addRootComment("Root comment")
		expect(root?.parentId).toBe(-1)
	})

	it("adds a reply with the correct parentId", async () => {
		const root = await db.addRootComment("Root")
		await root!.reply("Reply A")

		const replies = await db.comments.where("parentId").equals(root!.id).toArray()
		expect(replies).toHaveLength(1)
		expect(replies[0].parentId).toBe(root!.id)
	})

	it("stores text correctly for comments and replies", async () => {
		const root = await db.addRootComment("Root text")
		await root!.reply("Reply text")

		const storedRoot = await db.comments.get(root!.id)
		const storedReply = await db.comments.where("parentId").equals(root!.id).first()

		expect(storedRoot?.text).toBe("Root text")
		expect(storedReply?.text).toBe("Reply text")
	})

	it("deleting a comment deletes all its replies recursively", async () => {
		const root = await db.addRootComment("Root")
		const reply = await root!.reply("Reply")
		await (await db.comments.get(reply!.id))?.reply("Nested reply")

		await root!.delete()

		const all = await db.comments.toArray()
		expect(all).toHaveLength(0)
	})

	it("deleting a comment removes it from the database", async () => {
		const root = await db.addRootComment("Root")
		await root!.delete()

		const found = await db.comments.get(root!.id)
		expect(found).toBeUndefined()
	})
})
