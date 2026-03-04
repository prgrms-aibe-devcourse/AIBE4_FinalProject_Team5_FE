import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProblemList = () => {
	const navigate = useNavigate();
	// 1. 상태(State) 관리
	const [problems, setProblems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedLevel, setSelectedLevel] = useState('전체');
	const [selectedTag, setSelectedTag] = useState('전체');

	// 사용할 태그와 난이도 목록
	const tagsList = ['해시', 'DP', '트리', '그래프', '스택', '탐색', '문자열', 'BFS', '배열'];
	const levelsList = [1, 2, 3, 4, 5];

	// 2. 백엔드 API 호출
	useEffect(() => {
		const fetchProblems = async () => {
			try {
				const apiUrl = import.meta.env.VITE_API_BASE_URL
					? `${import.meta.env.VITE_API_BASE_URL}/coditor/problems`
					: 'http://localhost:8080/coditor/problems';

				const response = await axios.get(apiUrl);

				setProblems(response.data);
			} catch (err) {
				console.error('API 호출 에러:', err);
				setError('문제 목록을 불러오는데 실패했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProblems();
	}, []);

	// 3. 필터링 로직 (검색어 + 난이도 + 태그)
	const filteredProblems = problems.filter((problem) => {

		const titleMatch = problem.title ? problem.title.includes(searchTerm) : false;
		const levelMatch = selectedLevel === '전체' || problem.level === selectedLevel;
		const tagMatch = selectedTag === '전체' || (problem.tags && problem.tags.includes(selectedTag));

		return titleMatch && levelMatch && tagMatch;
	});

	if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>데이터를 불러오는 중입니다... ⏳</div>;
	if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

	return (
		<div style={{ display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

			{/* 🟢 좌측 사이드바 (필터 영역) */}
			<aside style={{ width: '250px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
				<h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>필터</h2>

				{/* 난이도 필터 */}
				<div style={{ marginBottom: '24px' }}>
					<h3 style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>난이도</h3>
					<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<li
							onClick={() => setSelectedLevel('전체')}
							style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedLevel === '전체' ? '#eef2ff' : 'transparent', color: selectedLevel === '전체' ? '#4f46e5' : '#333' }}
						>
							전체
						</li>
						{levelsList.map(level => (
							<li
								key={level}
								onClick={() => setSelectedLevel(level)}
								style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedLevel === level ? '#eef2ff' : 'transparent', color: selectedLevel === level ? '#4f46e5' : '#333' }}
							>
								Level {level}
							</li>
						))}
					</ul>
				</div>

				{/* 알고리즘 태그 필터 */}
				<div>
					<h3 style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>알고리즘 태그</h3>
					<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
						<li
							onClick={() => setSelectedTag('전체')}
							style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedTag === '전체' ? '#eef2ff' : 'transparent', color: selectedTag === '전체' ? '#4f46e5' : '#333' }}
						>
							전체
						</li>
						{tagsList.map(tag => (
							<li
								key={tag}
								onClick={() => setSelectedTag(tag)}
								style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', backgroundColor: selectedTag === tag ? '#eef2ff' : 'transparent', color: selectedTag === tag ? '#4f46e5' : '#333' }}
							>
								{tag}
							</li>
						))}
					</ul>
				</div>
			</aside>

			{/* 🟢 우측 메인 영역 (검색 및 문제 리스트) */}
			<main style={{ flex: 1 }}>

				{/* 상단 검색바 */}
				<div style={{ marginBottom: '20px' }}>
					<input
						type="text"
						placeholder="🔍 문제 제목으로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
					/>
				</div>

				{/* 문제 테이블 */}
				<div style={{ border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
						<thead style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
						<tr>
							<th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '10%' }}>상태</th>
							<th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '50%' }}>문제 제목</th>
							<th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '15%' }}>난이도</th>
							<th style={{ padding: '16px', fontWeight: '500', color: '#555', width: '25%' }}>카테고리</th>
						</tr>
						</thead>
						<tbody>
						{filteredProblems.length > 0 ? (
							filteredProblems.map(problem => (
								<tr key={problem.id} style={{ borderBottom: '1px solid #eee' }}>
									<td style={{ padding: '16px', textAlign: 'center' }}>
										{/* 추후 isSolved 추가, 일단 - 상태로 고정 */}
										<span style={{ color: '#ccc' }}>-</span>
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
			</main>

		</div>
	);
};

export default ProblemList;
