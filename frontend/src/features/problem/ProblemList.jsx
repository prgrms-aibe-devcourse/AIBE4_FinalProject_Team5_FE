import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const ProblemList = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('전체');
    const [selectedTag, setSelectedTag] = useState('전체');

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const tagsList = ['해시', 'DP', '트리', '그래프', '스택', '탐색', '문자열', 'BFS', '배열'];
    const levelsList = [1, 2, 3, 4, 5];

    useEffect(() => {
        const fetchProblems = async () => {
            setIsLoading(true);
            try {
                const params = {
                    page: currentPage,
                    size: 10
                };
                if (searchTerm) params.keyword = searchTerm;
                if (selectedLevel !== '전체') params.level = selectedLevel;
                if (selectedTag !== '전체') params.tag = selectedTag;

                const response = await api.get('/coditor/problems', { params });

                setProblems(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error('API 호출 에러:', err);
                setError('문제 목록을 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProblems();
    }, [searchTerm, selectedLevel, selectedTag, currentPage]);

    if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

    return (
        <div style={{ display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <aside style={{ width: '250px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>필터</h2>

                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>난이도</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li
                            onClick={() => {setSelectedLevel('전체'); setCurrentPage(0);}}
                            style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedLevel === '전체' ? '#eef2ff' : 'transparent', color: selectedLevel === '전체' ? '#4f46e5' : '#333' }}
                        >
                            전체
                        </li>
                        {levelsList.map(level => (
                            <li
                                key={level}
                                onClick={() => {setSelectedLevel(level); setCurrentPage(0);}}
                                style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedLevel === level ? '#eef2ff' : 'transparent', color: selectedLevel === level ? '#4f46e5' : '#333' }}
                            >
                                Level {level}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>알고리즘 태그</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                        <li
                            onClick={() => {setSelectedTag('전체'); setCurrentPage(0);}}
                            style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedTag === '전체' ? '#eef2ff' : 'transparent', color: selectedTag === '전체' ? '#4f46e5' : '#333' }}
                        >
                            전체
                        </li>
                        {tagsList.map(tag => (
                            <li
                                key={tag}
                                onClick={() => {setSelectedTag(tag); setCurrentPage(0);}}
                                style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedTag === tag ? '#eef2ff' : 'transparent', color: selectedTag === tag ? '#4f46e5' : '#333' }}
                            >
                                {tag}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main style={{ flex: 1 }}>
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 문제 제목으로 검색..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearchTerm(searchInput);
                                setCurrentPage(0);
                            }
                        }}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
                    />
                </div>

                <div style={{ position: 'relative', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
                    {isLoading && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: '#4f46e5' }}>
                            검색 중... ⏳
                        </div>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '10%' }}></th>
                            <th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '50%' }}>문제 제목</th>
                            <th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '15%' }}>난이도</th>
                            <th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '25%' }}>카테고리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {problems.length > 0 ? (
                            problems.map(problem => (
                                <tr key={problem.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <span style={{ color: '#ccc' }}></span>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '500', cursor: 'pointer', color: '#333' }} onClick={() => navigate(`/problems/${problem.id}`)}>
                                        {problem.title}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>Lv.{problem.level}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {problem.tags && problem.tags.map(tag => (
                                            <span key={tag} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '4px', display: 'inline-block', marginBottom: '4px' }}>
                                          {tag}
                                        </span>
                                        ))}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                                    검색 결과가 없거나 등록된 문제가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: currentPage === 0 ? '#f3f4f6' : '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                        >
                            이전
                        </button>

                        <span style={{ fontSize: '15px', color: '#555' }}>
                         {currentPage + 1} / {totalPages} 페이지
                      </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            disabled={currentPage === totalPages - 1}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: currentPage === totalPages - 1 ? '#f3f4f6' : '#fff', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                        >
                            다음
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProblemList;