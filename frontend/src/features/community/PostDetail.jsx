import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../auth/authStore';

const CommentItem = ({
						 comment,
						 depth = 0,
						 replyingTo,
						 replyContent,
						 setReplyingTo,
						 setReplyContent,
						 handleSubmitComment,
						 formatDateTime,
						 currentUser,
						 onUpdateComment,
						 onDeleteComment
					 }) => {
	const isReplying = replyingTo === comment.id;

	// 댓글 수정 모드 상태
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);

	// 댓글 작성자 권한 체크
	const isAuthor = currentUser && currentUser.memberId === comment.authorId;

	// 수정 완료 버튼 클릭
	const handleEditSubmit = () => {
		if (!editContent.trim()) {
			alert('댓글 내용을 입력해주세요.');
			return;
		}
		onUpdateComment(comment.id, editContent);
		setIsEditing(false); // 수정 모드 종료
	};

	return (
		<div style={{ marginLeft: `${depth * 24}px`, marginTop: '16px' }}>
			<div style={{ padding: '16px', backgroundColor: depth > 0 ? '#f9fafb' : '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#374151' }}>
                        {depth > 0 && '↳ '} 🧑‍ {comment.authorNickname || '알 수 없음'}
                    </span>
					<span style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDateTime(comment.createdAt)}</span>
				</div>

				{isEditing ? (
					<div style={{ marginBottom: '12px' }}>
                        <textarea
							value={editContent}
							onChange={(e) => setEditContent(e.target.value)}
							style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', resize: 'vertical', fontFamily: 'inherit' }}
							rows="2"
						/>
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
							<button onClick={() => { setIsEditing(false); setEditContent(comment.content); }} style={{ padding: '4px 12px', fontSize: '12px', cursor: 'pointer', border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: '4px' }}>취소</button>
							<button onClick={handleEditSubmit} style={{ padding: '4px 12px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '4px' }}>수정 완료</button>
						</div>
					</div>
				) : (
					<div style={{ fontSize: '15px', color: '#111827', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
						{comment.content}
					</div>
				)}

				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					{/* 답글 달기 버튼 (1뎁스까지만) */}
					{depth < 1 && !isEditing && (
						<button
							onClick={() => {
								setReplyingTo(isReplying ? null : comment.id);
								setReplyContent('');
							}}
							style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', padding: 0 }}
						>
							{isReplying ? '취소' : '답글 달기'}
						</button>
					)}

					{/* 작성자에게만 보이는 수정/삭제 버튼 */}
					{isAuthor && !isEditing && (
						<div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
							<button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', padding: 0 }}>수정</button>
							<button onClick={() => { if(window.confirm('댓글을 삭제하시겠습니까?')) onDeleteComment(comment.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}>삭제</button>
						</div>
					)}
				</div>
			</div>

			{/* 답글 입력 폼 */}
			{isReplying && (
				<div style={{ marginTop: '8px', marginLeft: '24px', display: 'flex', gap: '8px' }}>
					<input type="text" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="답글을 입력하세요..." style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }} autoFocus />
					<button onClick={() => handleSubmitComment(comment.id)} style={{ padding: '0 16px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>등록</button>
				</div>
			)}

			{/* 대댓글 재귀 렌더링 */}
			{comment.children && comment.children.length > 0 && (
				<div style={{ borderLeft: '2px solid #e5e7eb', marginLeft: '12px', paddingLeft: '4px' }}>
					{comment.children.map(child => (
						<CommentItem
							key={child.id}
							comment={child}
							depth={depth + 1}
							replyingTo={replyingTo}
							replyContent={replyContent}
							setReplyingTo={setReplyingTo}
							setReplyContent={setReplyContent}
							handleSubmitComment={handleSubmitComment}
							formatDateTime={formatDateTime}
							currentUser={currentUser}
							onUpdateComment={onUpdateComment}
							onDeleteComment={onDeleteComment}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const PostDetail = () => {
	const { id: postId } = useParams();
	const navigate = useNavigate();

	const [post, setPost] = useState(null);
	const [comments, setComments] = useState([]);

	const [newComment, setNewComment] = useState('');
	const [replyingTo, setReplyingTo] = useState(null);
	const [replyContent, setReplyContent] = useState('');

	const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

	const { user } = useAuthStore();

	const fetchPostAndComments = useCallback(async () => {
		try {
			const [postRes, commentsRes] = await Promise.all([
				axios.get(`${baseUrl}/coditor/posts/${postId}`),
				axios.get(`${baseUrl}/coditor/comments/post/${postId}`)
			]);
			setPost(postRes.data);
			setComments(commentsRes.data || []);
		} catch (error) {
			console.error('데이터 불러오기 에러:', error);
			alert('게시글을 불러오지 못했습니다.');
			navigate('/community');
		}
	}, [postId, baseUrl, navigate]);

	useEffect(() => {
		fetchPostAndComments();
	}, [fetchPostAndComments]);

	const formatDateTime = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	};

	const handleSubmitComment = async (parentId = null) => {
		const content = parentId ? replyContent : newComment;
		if (!content.trim()) {
			alert('댓글 내용을 입력해주세요.');
			return;
		}

		try {
			await axios.post(`${baseUrl}/coditor/comments`, {
				postId: Number(postId),
				parentId: parentId,
				content: content
			});

			if (parentId) {
				setReplyingTo(null);
				setReplyContent('');
			} else {
				setNewComment('');
			}
			fetchPostAndComments();
		} catch (error) {
			console.error('댓글 작성 실패:', error);
			alert('댓글 작성에 실패했습니다.');
		}
	};

	const handleUpdateComment = async (commentId, updatedContent) => {
		try {
			await axios.patch(`${baseUrl}/coditor/comments/${commentId}`, { content: updatedContent });
			fetchPostAndComments(); // 수정 후 새로고침
		} catch (error) {
			console.error('댓글 수정 실패:', error);
			alert('댓글 수정에 실패했습니다.');
		}
	};

	const handleDeleteComment = async (commentId) => {
		try {
			await axios.delete(`${baseUrl}/coditor/comments/${commentId}`);
			fetchPostAndComments(); // 삭제 후 새로고침
		} catch (error) {
			console.error('댓글 삭제 실패:', error);
			alert('댓글 삭제에 실패했습니다.');
		}
	};

	const handleDeletePost = async () => {
		if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
			try {
				await axios.delete(`${baseUrl}/coditor/posts/${postId}`);
				alert('삭제되었습니다.');
				navigate('/community'); // 삭제 후 목록
			} catch (error) {
				console.error('게시글 삭제 실패:', error);
				alert('게시글 삭제에 실패했습니다.');
			}
		}
	};

	if (!post) return <div style={{ textAlign: 'center', padding: '50px' }}>로딩 중...</div>;

	// 게시글 작성자 권한 체크
	const isAuthor = user && user.memberId === post.authorId;

	return (
		<div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
			{/* 뒤로 가기 버튼 */}
			<button onClick={() => navigate('/community')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', marginBottom: '24px', fontSize: '15px', padding: 0 }}>
				← 목록으로 돌아가기
			</button>

			{/* 게시글 본문 영역 */}
			<div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>

				{post.problemId && (
					<div style={{ marginBottom: '16px', fontSize: '14px' }}>
                        <span
							style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '20px' }}
							onClick={() => navigate(`/problems/${post.problemId}`)}
						>
                            🚀 [ {post.problemTitle} ] 질문
                        </span>
					</div>
				)}

				{/* 제목 */}
				<h1 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: 'bold' }}>{post.title}</h1>

				{/* 작성자 정보 & (권한 있을 시) 수정/삭제 버튼 */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6', marginBottom: '24px' }}>
					<div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
						<span>🧑‍ {post.authorNickname || '익명'}</span>
						<span>📅 {formatDateTime(post.createdAt)}</span>
					</div>

					{isAuthor && (
						<div style={{ display: 'flex', gap: '8px' }}>
							<button
								onClick={() => navigate(`/posts/edit/${post.id}`)}
								style={{ padding: '6px 14px', backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
							>
								수정
							</button>
							<button
								onClick={handleDeletePost}
								style={{ padding: '6px 14px', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
							>
								삭제
							</button>
						</div>
					)}
				</div>

				{/* 본문 내용 */}
				<div style={{ fontSize: '16px', lineHeight: '1.6', color: '#1f2937', minHeight: '150px', whiteSpace: 'pre-wrap' }}>
					{post.content}
				</div>
			</div>

			{/* 댓글 영역 */}
			<div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
				<h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>댓글 {comments.length}개</h3>

				{/* 댓글 목록 렌더링 */}
				<div style={{ marginBottom: '32px' }}>
					{comments.map(comment => (
						<CommentItem
							key={comment.id}
							comment={comment}
							depth={0}
							replyingTo={replyingTo}
							replyContent={replyContent}
							setReplyingTo={setReplyingTo}
							setReplyContent={setReplyContent}
							handleSubmitComment={handleSubmitComment}
							formatDateTime={formatDateTime}
							currentUser={user}
							onUpdateComment={handleUpdateComment}
							onDeleteComment={handleDeleteComment}
						/>
					))}
				</div>

				{/* 루트(새) 댓글 폼 */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="게시글에 댓글을 남겨보세요..."
						rows="3"
						style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical', fontFamily: 'inherit' }}
					/>
					<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
						<button
							onClick={() => handleSubmitComment(null)}
							style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
						>
							댓글 등록
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PostDetail;
