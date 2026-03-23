import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

const PostList = () => {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [problems, setProblems] = useState([]);
    const [selectedProblemId, setSelectedProblemId] = useState(null);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await api.get('/coditor/posts/problems');
                setProblems(response.data || []);
            } catch (error) {
                console.error('문제 목록을 불러오지 못했습니다.', error);
            }
        };
        fetchProblems();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const params = { page: currentPage };
                if (searchTerm) params.keyword = searchTerm;
                if (selectedProblemId) params.problemId = selectedProblemId;

                const response = await api.get('/coditor/posts', { params });

                setPosts(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            } catch (error) {
                console.error('게시글 목록을 불러오지 못했습니다.', error);
            }
        };

        fetchPosts();
    }, [currentPage, searchTerm, selectedProblemId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    return (
        <div style={{ display: 'flex', gap: '24px', maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
            <aside style={{ width: '250px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff', height: 'fit-content' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>문제 필터</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                    <li
                        onClick={() => { setSelectedProblemId(null); setCurrentPage(0); }}
                        style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '6px', backgroundColor: selectedProblemId === null ? '#eff6ff' : 'transparent', color: selectedProblemId === null ? '#2563eb' : '#374151', fontWeight: selectedProblemId === null ? 'bold' : 'normal' }}
                    >
                        전체 게시글 보기
                    </li>
                    {problems.map(problem => (
                        <li
                            key={problem.id}
                            onClick={() => { setSelectedProblemId(problem.id); setCurrentPage(0); }}
                            style={{ cursor: 'pointer', padding: '10px 12px', borderRadius: '6px', backgroundColor: selectedProblemId === problem.id ? '#eff6ff' : 'transparent', color: selectedProblemId === problem.id ? '#2563eb' : '#374151', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {problem.title}
                        </li>
                    ))}
                </ul>
            </aside>

            <main style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>커뮤니티</h1>
                    <button
                        onClick={() => navigate('/posts/new')}
                        style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        글 작성
                    </button>
                </div>

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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
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
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                                    {post.title}
                                </h2>

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
            </main>
        </div>
    );
};

export default PostList;