import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProblemDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [problem, setProblem] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// 단건 문제 조회
	useEffect(() => {
		const fetchProblemDetail = async () => {
			try {
				const apiUrl = import.meta.env.VITE_API_BASE_URL
					? `${import.meta.env.VITE_API_BASE_URL}/coditor/problems/${id}`
					: `http://localhost:8080/coditor/problems/${id}`;

				const response = await axios.get(apiUrl);
				setProblem(response.data);
			} catch (err) {
				console.error('상세 조회 에러:', err);
				setError('문제 정보를 불러오는데 실패했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProblemDetail();
	}, [id]);

	if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>문제 불러오는 중... ⏳</div>;
	if (error || !problem) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error || '문제가 없습니다.'}</div>;

	return (
		<div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

			{/* 🟢 좌측 영역: 문제 설명, 입력/출력 설명, 입출력 예시 */}
			<div style={{ flex: 1, padding: '24px', overflowY: 'auto', borderRight: '1px solid #ddd', backgroundColor: '#fff' }}>

				{/* 뒤로 가기 버튼 */}
				<button
					onClick={() => navigate('/problems')}
					style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '16px', fontSize: '14px', padding: 0 }}
				>
					← 문제 목록으로
				</button>

				{/* 문제 제목 및 태그 */}
				<h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>{problem.title}</h1>
				<div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        Lv.{problem.level}
                    </span>
					{problem.tags.map(tag => (
						<span key={tag} style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
                            {tag}
                        </span>
					))}
				</div>

				{/* 1. 문제 설명 (content) */}
				<div style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{problem.content}
					</ReactMarkdown>
				</div>

				<hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #eee' }} />

				{/* 2. 입력 설명 (inputDesc) */}
				<div style={{ marginBottom: '24px' }}>
					<h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>입력</h2>
					<div style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{problem.inputDesc}
						</ReactMarkdown>
					</div>
				</div>

				{/* 3. 출력 설명 (outputDesc) */}
				<div>
					<h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>출력</h2>
					<div style={{ lineHeight: '1.6', color: '#333', fontSize: '15px' }}>
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{problem.outputDesc}
						</ReactMarkdown>
					</div>
				</div>

				<hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #eee' }} />

				{/* 4. 입출력 예시 테이블 (examples) */}
				<div>
					<h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>입출력 예시</h2>
					<table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
						<thead style={{ backgroundColor: '#f8f9fa' }}>
						<tr>
							<th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', width: '50%' }}>입력 (Input)</th>
							<th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', width: '50%' }}>출력 (Output)</th>
						</tr>
						</thead>
						<tbody>
						{problem.examples.map((ex) => (
							<tr key={ex.id}>
								<td style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#fafafa', verticalAlign: 'top' }}>
									<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ex.inputExample}</pre>
								</td>
								<td style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#fafafa', verticalAlign: 'top' }}>
									<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ex.outputExample}</pre>
								</td>
							</tr>
						))}
						</tbody>
					</table>
				</div>
			</div>

			{/* 🔵 우측 영역: IDE 및 코드 실행 (에디터 연동) */}
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
				<div style={{ padding: '12px', backgroundColor: '#2d2d2d', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between' }}>
					<select style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#3c3c3c', color: '#fff', border: 'none' }}>
						<option>Java</option>
						<option>Python</option>
					</select>
					<span>🌙</span>
				</div>

				<div style={{ flex: 1, padding: '16px', fontFamily: 'monospace', fontSize: '14px' }}>
					<p style={{ color: '#6a9955' }}>// Monaco Editor </p>
				</div>

				<div style={{ padding: '16px', borderTop: '1px solid #444', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
					<button style={{ padding: '8px 16px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>코드 실행</button>
					<button style={{ padding: '8px 16px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>제출</button>
				</div>
			</div>

		</div>
	);
};

export default ProblemDetail;
