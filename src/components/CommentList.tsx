import CommentItem from "./CommentItem"
import type { Comment } from "../types"

interface CommentListProps {
	comments: Comment[]
}

const CommentList = ({ comments }: CommentListProps) => {
	return (
		<div className="space-y-2">
			{
				comments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
					/>
				))
			}
		</div>
	)
}

export default CommentList