import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Comments from "../src/components/Comments"
import { db } from "../src/db/db"
import { beforeEach, describe, it, expect } from "vitest"

describe("Comments component", () => {
	beforeEach(async () => {
		await db.comments.clear()
	})

	it("renders input and comment button", async () => {
		render(<Comments />)
		const input = await screen.findByPlaceholderText("Please enter comment")
		expect(input).toBeInTheDocument()
		expect(screen.getByText("Comment")).toBeInTheDocument()
	})

	it("can add a new comment", async () => {
		render(<Comments />)
		const input = await screen.findByPlaceholderText("Please enter comment")
		const button = await screen.findByText("Comment")

		await userEvent.type(input, "Hello world")
		await userEvent.click(button)

		const savedComment = await screen.findByText("Hello world")
		expect(savedComment).toBeInTheDocument()

		const allComments = await db.comments.toArray()
		expect(allComments.length).toBe(1)
		expect(allComments[0].text).toBe("Hello world")
		expect(allComments[0].parentId).toBe(-1)
	})

	it("can delete a comment", async () => {
		const id = await db.comments.add({ parentId: -1, text: "Delete me", createdAt: new Date() })

		render(<Comments />)
		const deleteButton = await screen.findByText("Delete")
		await userEvent.click(deleteButton)

		expect(screen.queryByText("Delete me")).toBeNull()

		const saved = await db.comments.get(id)
		expect(saved).toBeUndefined()
	})

	it("can add a reply to a comment", async () => {
		const commentId = await db.comments.add({
			parentId: -1,
			text: "Parent comment",
			createdAt: new Date(),
		})

		render(<Comments />)

		const parentComment = await screen.findByText("Parent comment")
		const parentDiv = parentComment.closest("div")!

		const replyButton = within(parentDiv).getByText("Reply", { selector: "button" })
		await userEvent.click(replyButton)

		const replyInput = await screen.findByPlaceholderText("Reply")

		const sendReplyButton = within(replyInput.closest("div")!).getByText("Reply", { selector: "button" })

		await userEvent.type(replyInput, "This is a reply")
		await userEvent.click(sendReplyButton)

		const reply = await screen.findByText("This is a reply")
		expect(reply).toBeInTheDocument()

		const repliesInDB = await db.comments.where("parentId").equals(commentId).toArray()
		expect(repliesInDB.length).toBe(1)
		expect(repliesInDB[0].text).toBe("This is a reply")
	})

	it("deletes comment with all replies", async () => {
		const parentId = await db.comments.add({ parentId: -1, text: "Parent", createdAt: new Date() })
		await db.comments.add({ parentId, text: "Child 1", createdAt: new Date() })
		await db.comments.add({ parentId, text: "Child 2", createdAt: new Date() })

		render(<Comments />)

		const deleteButton = await screen.findByText("Delete")
		await userEvent.click(deleteButton)

		await waitFor(async () => {
			expect(screen.queryByText("Parent")).toBeNull()
			expect(screen.queryByText("Child 1")).toBeNull()
			expect(screen.queryByText("Child 2")).toBeNull()
		})


		const allComments = await db.comments.toArray()
		expect(allComments.length).toBe(0)
	})
})
