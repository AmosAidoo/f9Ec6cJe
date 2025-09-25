import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"
import CommentList from "./CommentList"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Loader2Icon } from "lucide-react"

const Comments = () => {
	const [newComment, setNewComment] = useState("")
	const comments = useLiveQuery(() => db.comments.where("parentId").equals(-1).toArray(), [])

	const handleAddComment = async () => {
		if (!newComment.trim()) return
		await db.addRootComment(newComment.trim())
		setNewComment("")
	}

	if (!comments) return <Loader2Icon className="animate-spin" />
	
	return (
		<div>
			<div className="flex flex-col sm:flex-row gap-2 mb-4">
				<Input
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder="Please enter comment"
				/>
				<Button onClick={handleAddComment}>Comment</Button>
			</div>

			<CommentList
				comments={comments}
			/>
		</div>
	)
}

export default Comments