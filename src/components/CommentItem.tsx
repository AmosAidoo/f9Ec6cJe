import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import type { Comment } from "../types"
import CommentList from "./CommentList"

interface CommentItemProps {
	comment: Comment
}

const CommentItem = ({ comment }: CommentItemProps) => {
	const [showReply, setShowReply] = useState(false)
	const [replyText, setReplyText] = useState("")

	const replies = useLiveQuery(
		() => db.comments.where("parentId").equals(comment.id).toArray(),
		[comment.id]
	)

	const handleReplyToComment = async (comment: Comment) => {
		if (!replyText.trim()) return
		await comment.reply(replyText.trim())
		setReplyText("")
		setShowReply(false)
	}

	const handleCancelReply = () => {
		setReplyText("")
		setShowReply(false)
	}

	const handleDeleteComment = async (comment: Comment) => {
		await comment.delete()
	}

	return (
		<div className="pl-4 border-l border-gray-200">
			<div className="flex flex-col gap-1">
				<span className="break-words">{comment.text}</span>
				<div className="flex gap-2 text-sm">
					<Button variant="link" size="sm" className="p-0" onClick={() => setShowReply(true)}>
						Reply
					</Button>
					<Button variant="link" size="sm" className="p-0" onClick={() => handleDeleteComment(comment)}>
						Delete
					</Button>
				</div>
			</div>

			{showReply && (
				<div className="flex w-full flex-col sm:flex-row sm:max-w-sm gap-2 my-2">
					<Input
						value={replyText}
						onChange={e => setReplyText(e.target.value)}
						placeholder="Reply"
					/>
					<div className="flex gap-2">
						<Button variant="link" size="sm" className="p-0" onClick={() => handleReplyToComment(comment)}>
							Reply
						</Button>
						<Button variant="link" size="sm" className="p-0" onClick={handleCancelReply}>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{replies && replies.length > 0 && (
				<CommentList
					comments={replies}
				/>
			)}
		</div>
	)
}

export default CommentItem