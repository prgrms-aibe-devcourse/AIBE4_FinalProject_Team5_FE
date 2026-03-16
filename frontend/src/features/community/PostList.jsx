import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostList = () => {
	const navigate = useNavigate();

	// 상태 관리
	const [posts, setPosts] = useState([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [searchInput, setSearchInput] = useState('');
	const [searchTerm, setSearchTerm] = useState('');

	// 게시글 목록 불러오기
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

				const params = { page: currentPage };
				if (searchTerm) params.keyword = searchTerm;

				const response = await axios.get(`${baseUrl}/coditor/posts`, { params });

				setPosts(response.data.content || []);
				setTotalPages(response.data.totalPages || 0);
			} catch (error) {
				console.error('게시글 목록을 불러오지 못했습니다.', error);
			}
		};

		fetchPosts();
	}, [currentPage, searchTerm]);

	const formatDate = (dateString) => {
		if (!dateString) return '';
		return dateString.split('T')[0];
	};

	return (
		<div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
			{/* 상단 헤더 & 글 작성 버튼 */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
				<h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>커뮤니티</h1>
				<button
					onClick={() => navigate('/posts/new')}
					style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
				>
					글 작성
				</button>
			</div>

			{/* 검색창 */}
			<div style={{ marginBottom: '32px' }}>
				<input
					type="text"
					placeholder="🔍 게시글 검색... "
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							setSearchTerm(searchInput);
							setCurrentPage(0);
						}
					}}
					style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', boxSizing: 'border-box' }}
				/>
			</div>

			{/* 게시글 목록 */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
				{posts.length === 0 ? (
					<div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
						등록된 게시글이 없습니다. 첫 글을 작성해 보세요!
					</div>
				) : (
					posts.map(post => (
						<div
							key={post.id}
							onClick={() => navigate(`/posts/${post.id}`)}
							style={{ padding: '24px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
							onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
							onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
						>
							{/* 게시글 제목 */}
							<h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
								{post.title}
							</h2>

							{/* 하단 작성자 및 날짜 정보 */}
							<div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    🧑‍ {post.authorNickname || '알 수 없음'}
                                </span>
								<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    📅 {formatDate(post.createdAt)}
                                </span>
							</div>
						</div>
					))
				)}
			</div>

			{/* 페이지네이션 */}
			{totalPages > 0 && (
				<div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
					<button
						onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
						disabled={currentPage === 0}
						style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: currentPage === 0 ? '#f3f4f6' : '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
					>
						이전
					</button>
					<span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                        {currentPage + 1} / {totalPages}
                    </span>
					<button
						onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
						disabled={currentPage === totalPages - 1}
						style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: currentPage === totalPages - 1 ? '#f3f4f6' : '#fff', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer' }}
					>
						다음
					</button>
				</div>
			)}
		</div>
	);
};

export default PostList;
