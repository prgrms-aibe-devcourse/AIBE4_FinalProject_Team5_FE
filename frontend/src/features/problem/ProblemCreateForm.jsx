import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../auth/authStore';

const ProblemCreateForm = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const [title, setTitle] = useState('');
	const [level, setLevel] = useState(1);
	const [timeLimit, setTimeLimit] = useState(2.0);
	const [memoryLimit, setMemoryLimit] = useState(256);
	const [isVisible, setIsVisible] = useState(true);

	const [content, setContent] = useState('');
	const [inputDesc, setInputDesc] = useState('');
	const [outputDesc, setOutputDesc] = useState('');

	const [examples, setExamples] = useState([{ inputExample: '', outputExample: '' }]);

	const [inputFile, setInputFile] = useState(null);
	const [outputFile, setOutputFile] = useState(null);

	const [dbTags, setDbTags] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);

	// 백엔드에서 태그 목록 불러오기
	useEffect(() => {
		const fetchTags = async () => {
			try {
				const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
				const response = await axios.get(`${baseUrl}/coditor/tags`);
				setDbTags(response.data);
			} catch (error) {
				console.error('태그 목록 불러오기 실패:', error);
			}
		};
		fetchTags();
	}, []);

	if (!user || user.role !== 'ADMIN') {
		return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>관리자만 접근 가능한 페이지입니다.</div>;
	}

	// 예시 조작 핸들러
	const handleAddExample = () => setExamples([...examples, { inputExample: '', outputExample: '' }]);
	const handleRemoveExample = (index) => setExamples(examples.filter((_, i) => i !== index));
	const handleExampleChange = (index, field, value) => {
		const newExamples = [...examples];
		newExamples[index][field] = value;
		setExamples(newExamples);
	};

	// 태그 클릭 핸들러 (토글 방식)
	const handleTagToggle = (tagName) => {
		if (selectedTags.includes(tagName)) {
			setSelectedTags(selectedTags.filter(t => t !== tagName));
		} else {
			setSelectedTags([...selectedTags, tagName]);
		}
	};

	// 🚀 폼 제출
	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

			// 문제 기본 정보 생성
			const requestData = {
				title,
				content,
				inputDesc,
				outputDesc,
				level,
				timeLimit,
				memoryLimit,
				isVisible,
				tags: selectedTags,
				examples
			};

			console.log("1단계: 문제 기본 정보 전송 중...", requestData);
			const problemResponse = await axios.post(`${baseUrl}/coditor/admin/problems`, requestData);
			const createdProblemId = problemResponse.data.id;

			console.log(`문제 생성 완료 (ID: ${createdProblemId})`);

			// 테스트케이스 파일 업로드
			if (inputFile && outputFile) {
				console.log("2단계: 테스트케이스 파일 전송 중...");
				// const formData = new FormData();
				// formData.append('inputFile', inputFile);
				// formData.append('outputFile', outputFile);
				//
				// await axios.post(`${baseUrl}/coditor/admin/problems/${createdProblemId}/testcases`, formData, {
				// 	headers: { 'Content-Type': 'multipart/form-data' }
				// });
				// console.log("테스트케이스 파일 업로드 완료");
			}

			alert('문제가 성공적으로 등록되었습니다!');
			navigate(`/problems/${createdProblemId}`);

		} catch (error) {
			console.error('문제 등록 실패:', error);
			alert('문제 등록 중 오류가 발생했습니다.');
		}
	};

	return (
		<div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
			<h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>🚀 문제 등록 (관리자)</h1>
			<p style={{ color: '#666', marginBottom: '32px' }}>문제를 생성하고 테스트케이스 파일을 업로드합니다.</p>

			<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

				{/* 1. 기본 정보 섹션 */}
				<section style={styles.section}>
					<h2 style={styles.sectionTitle}>1. 기본 정보</h2>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
						<div style={{ gridColumn: '1 / -1' }}>
							<label style={styles.label}>문제 제목</label>
							<input required style={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 두 수의 합" />
						</div>
						<div>
							<label style={styles.label}>난이도 (Level)</label>
							<select style={styles.input} value={level} onChange={e => setLevel(Number(e.target.value))}>
								{[1,2,3,4,5].map(l => <option key={l} value={l}>Level {l}</option>)}
							</select>
						</div>
						<div>
							<label style={styles.label}>시간 제한 </label>
							<input required type="number" step="0.1" style={styles.input} value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
						</div>
						<div>
							<label style={styles.label}>메모리 제한 </label>
							<input required type="number" style={styles.input} value={memoryLimit} onChange={e => setMemoryLimit(Number(e.target.value))} />
						</div>

						<div>
							<label style={styles.label}>문제 공개 여부</label>
							<div style={{ marginTop: '10px' }}>
								<label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
									<input
										type="checkbox"
										checked={isVisible}
										onChange={e => setIsVisible(e.target.checked)}
										style={{ width: '18px', height: '18px', cursor: 'pointer' }}
									/>
									등록 시 사용자에게 공개 (체크 해제 시 비공개)
								</label>
							</div>
						</div>

						<div style={{ gridColumn: '1 / -1' }}>
							<label style={styles.label}>알고리즘 태그 (다중 선택)</label>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', minHeight: '40px' }}>
								{dbTags.length === 0 ? (
									<span style={{ color: '#888', fontSize: '14px', margin: 'auto' }}>불러온 태그가 없습니다.</span>
								) : (
									dbTags.map(tag => {
										const isSelected = selectedTags.includes(tag.name);
										return (
											<button
												type="button"
												key={tag.id}
												onClick={() => handleTagToggle(tag.name)}
												style={{
													...styles.tagButton,
													backgroundColor: isSelected ? '#3b82f6' : '#e5e7eb',
													color: isSelected ? '#fff' : '#374151',
													border: isSelected ? '1px solid #2563eb' : '1px solid #d1d5db'
												}}
											>
												{tag.name}
											</button>
										);
									})
								)}
							</div>
							<p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>* 등록된 태그를 클릭하여 선택하거나 해제하세요.</p>
						</div>
					</div>
				</section>

				{/* 2. 문제 설명 섹션 */}
				<section style={styles.section}>
					<h2 style={styles.sectionTitle}>2. 문제 설명</h2>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<div>
							<label style={styles.label}>본문 내용</label>
							<textarea required style={styles.textarea} value={content} onChange={e => setContent(e.target.value)} rows="6" placeholder="문제 내용을 작성하세요..." />
						</div>
						<div>
							<label style={styles.label}>입력 설명</label>
							<textarea style={styles.textarea} value={inputDesc} onChange={e => setInputDesc(e.target.value)} rows="3" placeholder="입력값에 대한 설명..." />
						</div>
						<div>
							<label style={styles.label}>출력 설명</label>
							<textarea style={styles.textarea} value={outputDesc} onChange={e => setOutputDesc(e.target.value)} rows="3" placeholder="출력값에 대한 설명..." />
						</div>
					</div>
				</section>

				{/* 3. 입출력 예시 섹션 */}
				<section style={styles.section}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
						<h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>3. 입출력 예시 </h2>
						<button type="button" onClick={handleAddExample} style={styles.btnOutline}>+ 예시 추가</button>
					</div>
					{examples.map((ex, index) => (
						<div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-start' }}>
							<div style={{ flex: 1 }}>
								<label style={styles.label}>입력 예시 {index + 1}</label>
								<textarea required style={styles.textarea} value={ex.inputExample} onChange={e => handleExampleChange(index, 'inputExample', e.target.value)} rows="3" />
							</div>
							<div style={{ flex: 1 }}>
								<label style={styles.label}>출력 예시 {index + 1}</label>
								<textarea required style={styles.textarea} value={ex.outputExample} onChange={e => handleExampleChange(index, 'outputExample', e.target.value)} rows="3" />
							</div>
							{examples.length > 1 && (
								<button type="button" onClick={() => handleRemoveExample(index)} style={{ ...styles.btnOutline, color: 'red', borderColor: 'red', marginTop: '24px' }}>삭제</button>
							)}
						</div>
					))}
				</section>

				{/* 4. 테스트케이스 파일 업로드 */}
				<section style={{ backgroundColor: '#eef2ff', padding: '24px', borderRadius: '8px', border: '1px solid #c7d2fe' }}>
					<h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#3730a3' }}>4. 채점용 테스트케이스 </h2>

					<div style={{ display: 'flex', gap: '24px' }}>
						<div style={{ flex: 1, backgroundColor: '#fff', padding: '16px', borderRadius: '4px', border: '1px dashed #a5b4fc' }}>
							<label style={{ ...styles.label, color: '#3730a3' }}>📄 입력 파일 </label>
							<input type="file"  onChange={e => setInputFile(e.target.files[0])} accept=".txt" />
						</div>
						<div style={{ flex: 1, backgroundColor: '#fff', padding: '16px', borderRadius: '4px', border: '1px dashed #a5b4fc' }}>
							<label style={{ ...styles.label, color: '#3730a3' }}>📄 정답 파일 </label>
							<input type="file"  onChange={e => setOutputFile(e.target.files[0])} accept=".txt" />
						</div>
					</div>
				</section>

				{/* 제출 버튼 */}
				<button type="submit" style={{ padding: '16px', backgroundColor: '#2563eb', color: '#fff', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '16px' }}>
					문제 및 테스트케이스 등록하기
				</button>
			</form>
		</div>
	);
};

const styles = {
	section: { backgroundColor: '#f8f9fa', padding: '24px', borderRadius: '8px', border: '1px solid #ddd' },
	sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0 },
	label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#444' },
	input: { width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '15px' },
	textarea: { width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '14px' },
	btnOutline: { padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid #888', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
	tagButton: { padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }
};

export default ProblemCreateForm;
