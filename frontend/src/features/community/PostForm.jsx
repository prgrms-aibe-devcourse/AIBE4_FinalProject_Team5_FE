import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const PostForm = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const linkedProblemId = location.state?.problemId || null;
	const linkedProblemTitle = location.state?.problemTitle || '';

	// URL에 id 파라미터가 있으면 수정 모드, 없으면 새 글 작성
	const { id } = useParams();
	const isEditMode = !!id;

	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');

	const [isLoading, setIsLoading] = useState(isEditMode);
	const editorRef = useRef(null);

	const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

	// 수정 모드
	useEffect(() => {
		if (isEditMode) {
			const fetchPost = async () => {
				try {
					const response = await axios.get(`${baseUrl}/coditor/posts/${id}`);
					setTitle(response.data.title);
					setContent(response.data.content);
				} catch (error) {
					console.error('게시글 정보를 불러오지 못했습니다.', error);
					alert('게시글을 불러오지 못했습니다.');
					navigate('/community');
				} finally {
					setIsLoading(false);
				}
			};
			fetchPost();
		}
	}, [id, isEditMode, baseUrl, navigate]);

	// 폼 제출 핸들러 (작성 및 수정 완료 버튼)
	const handleSubmit = async (e) => {
		e.preventDefault();

		const currentContent = editorRef.current?.getInstance().getMarkdown() || '';

		if (!title.trim() || !currentContent.trim()) {
			alert('제목과 내용을 모두 입력해주세요.');
			return;
		}

		try {
			if (isEditMode) {
				await axios.patch(`${baseUrl}/coditor/posts/${id}`, {
					title,
					content: currentContent
				});
				alert('게시글이 성공적으로 수정되었습니다.');
				navigate(`/posts/${id}`);
			} else {
				const response = await axios.post(`${baseUrl}/coditor/posts`, {
					problemId: linkedProblemId,
					title,
					content: currentContent
				});
				alert('새 게시글이 등록되었습니다.');
				navigate(`/posts/${response.data.id}`);
			}
		} catch (error) {
			console.error('게시글 저장 실패:', error);
			alert('게시글 저장에 실패했습니다.');
		}
	};

	if (isLoading) {
		return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중입니다...</div>;
	}

	return (
		<div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
			<h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
				{isEditMode ? '게시글 수정' : '새 게시글 작성'}
			</h1>

			{/* 문제에서 넘어온 경우 어떤 문제에 대한 질문인지 표시 */}
			{!isEditMode && linkedProblemId && (
				<div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e3a8a', marginBottom: '24px', fontSize: '15px', fontWeight: 'bold' }}>
					🚀 [ {linkedProblemTitle} ] 문제에 대한 질문을 작성 중입니다.
				</div>
			)}

			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
				{/* 제목 입력란 */}
				<div>
					<label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
						제목
					</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="제목을 입력하세요"
						style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' }}
					/>
				</div>

				{/* 내용 입력란 */}
				<div>
					<label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
						내용
					</label>
					<Editor
						ref={editorRef}
						initialValue={content || " "}
						placeholder="내용을 입력하세요."
						previewStyle="vertical"
						height="500px"
						initialEditType="wysiwyg"
						useCommandShortcut={true}
					/>
				</div>

				{/* 버튼 영역 */}
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
					<button
						type="button"
						onClick={() => navigate(-1)}
						style={{ padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
					>
						취소
					</button>
					<button
						type="submit"
						style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
					>
						{isEditMode ? '수정 완료' : '등록 완료'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default PostForm;
