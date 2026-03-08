import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 백엔드 API 주소 (환경에 맞게 수정 필요)
const API_BASE_URL = 'http://localhost:8080';

/* ───────────────────────────────────────────
   더미 데이터 (잔디, 문제 목록)
─────────────────────────────────────────── */
const generateDummyActivity = () => {
	const data = {};
	const today = new Date();
	for (let i = 0; i < 364; i++) {
		if (Math.random() > 0.6) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			data[d.toISOString().slice(0, 10)] = Math.floor(Math.random() * 8) + 1;
		}
	}
	return data;
};

const dummyProblems = [
	{ id: 1, title: '두 수의 합',    level: 1,   solvedAt: '2025-03-01', language: 'Python' },
	{ id: 2, title: '피보나치 수열', level: 2,   solvedAt: '2025-03-02', language: 'JavaScript' },
	{ id: 3, title: '이진 탐색',     level: 2,   solvedAt: '2025-03-03', language: 'Java' },
	{ id: 4, title: '최단 경로',     level: 3, solvedAt: '2025-03-04', language: 'C++' },
	{ id: 5, title: '문자열 뒤집기', level: 1,   solvedAt: '2025-03-05', language: 'Python' },
	{ id: 6, title: '스택 구현',     level: 1,   solvedAt: '2025-03-05', language: 'JavaScript' },
];

const levelColor = { '쉬움': '#16a34a', '보통': '#d97706', '어려움': '#dc2626' };
const activityData = generateDummyActivity();

/* ───────────────────────────────────────────
   잔디 컴포넌트
─────────────────────────────────────────── */
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const SHOW_DAY_IDX = new Set([1, 3, 5]);
const CELL = 13, GAP = 2, STEP = CELL + GAP, Y_LABEL_W = 28;

const ActivityGrid = ({ data }) => {
	const weeks = 52, days = 7;
	const today = new Date();
	const cells = Array.from({ length: weeks * days }).map((_, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() - (weeks * days - 1 - i));
		const key = d.toISOString().slice(0, 10);
		return { date: key, count: data[key] || 0, dow: d.getDay() };
	});

	const getColor = (count) => {
		if (count === 0) return '#ebedf0';
		if (count <= 1) return '#9be9a8';
		if (count <= 3) return '#40c463';
		if (count <= 6) return '#30a14e';
		return '#216e39';
	};

	const weekColumns = Array.from({ length: weeks }, (_, w) => cells.slice(w * days, (w + 1) * days));
	const monthLabels = weekColumns.reduce((acc, week, wi) => {
		const firstDay = new Date(week[0]?.date);
		if (week[0] && firstDay.getDate() <= 7) {
			acc.push({ wi, label: `${firstDay.getMonth() + 1}월` });
		}
		return acc;
	}, []);

	const gridW = weeks * STEP - GAP, gridH = days * STEP - GAP, totalW = Y_LABEL_W + gridW, MONTH_ROW_H = 18;

	return (
		<div style={{ fontFamily: 'sans-serif' }}>
			<svg width={totalW} height={MONTH_ROW_H + gridH + 24}>
				{monthLabels.map(({ wi, label }) => (
					<text key={wi} x={Y_LABEL_W + wi * STEP} y={12} fontSize="11" fill="#666">{label}</text>
				))}
				{Array.from({ length: days }, (_, di) => (
					<text key={di} x={Y_LABEL_W - 4} y={MONTH_ROW_H + di * STEP + CELL - 1} fontSize="10" fill="#888" textAnchor="end">
						{SHOW_DAY_IDX.has(di) ? DAY_LABELS[di] : ''}
					</text>
				))}
				{weekColumns.map((week, wi) =>
					week.map((cell, di) => (
						<rect key={`${wi}-${di}`} x={Y_LABEL_W + wi * STEP} y={MONTH_ROW_H + di * STEP} width={CELL} height={CELL} rx={2} ry={2} fill={getColor(cell.count)}>
							<title>{`${cell.date}: ${cell.count}문제`}</title>
						</rect>
					))
				)}
			</svg>
			<div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', marginTop: '4px', marginLeft: `${Y_LABEL_W}px` }}>
				<span>적음</span>
				{[0, 1, 3, 5, 7].map(c => <div key={c} style={{ width: `${CELL}px`, height: `${CELL}px`, borderRadius: '2px', backgroundColor: getColor(c) }} />)}
				<span>많음</span>
			</div>
		</div>
	);
};

/* ───────────────────────────────────────────
   비밀번호 입력 + 눈 버튼 공통 컴포넌트
─────────────────────────────────────────── */
const PasswordInput = ({ name, value, onChange, placeholder }) => {
	const [show, setShow] = useState(false);
	return (
		<div style={{ position: 'relative' }}>
			<input style={{ ...ls.input, paddingRight: '40px' }} name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} />
			<button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#94a3b8', padding: 0, lineHeight: 1 }} title={show ? '숨기기' : '보기'}>
				{show ? '🙈' : '👁️'}
			</button>
		</div>
	);
};

/* ───────────────────────────────────────────
   회원정보 수정 모달
─────────────────────────────────────────── */
const EditProfileModal = ({ profile, isSocial, onSave, onClose }) => {
	const [form, setForm] = useState({
		nickname:        profile.nickname || '',
		email:           profile.email || '',
		phoneNumber:     profile.phoneNumber || '',
		introduce:       profile.introduce || '',
		password:        '',
		passwordConfirm: '',
	});
	const [msg, setMsg] = useState('');

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!isSocial && form.password && form.password !== form.passwordConfirm) {
			setMsg('❌ 비밀번호가 일치하지 않습니다.');
			return;
		}
		// password가 비어있으면, 서버로 전송하지 않도록 null 처리
		const dataToSave = {
			nickname: form.nickname,
			phoneNumber: form.phoneNumber,
			introduce: form.introduce,
			password: form.password || null,
		};
		onSave(dataToSave);
		onClose();
	};

	return (
		<div style={ms.overlay} onClick={onClose}>
			<div style={ms.box} onClick={e => e.stopPropagation()}>
				<button style={ms.closeBtn} onClick={onClose}>✕</button>
				<h2 style={ms.title}>회원정보 수정</h2>
				<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div>
						<label style={ls.label}>닉네임</label>
						<input style={ls.input} name="nickname" value={form.nickname} onChange={handleChange} required />
					</div>
					<div>
						<label style={ls.label}>이메일</label>
						<input style={ls.input} name="email" type="email" value={form.email} disabled />
					</div>
					<div>
						<label style={ls.label}>전화번호</label>
						<input style={ls.input} name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="010-0000-0000" />
					</div>
					<div>
						<label style={ls.label}>자기소개</label>
						<textarea style={{...ls.input, height: '80px', resize: 'vertical'}} name="introduce" value={form.introduce} onChange={handleChange} placeholder="자기소개를 입력하세요." />
					</div>
					{!isSocial && (
						<>
							<div>
								<label style={ls.label}>새 비밀번호 <span style={{ color: '#aaa', fontSize: '0.78rem' }}>(변경 시에만 입력)</span></label>
								<PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="새 비밀번호" />
							</div>
							<div>
								<label style={ls.label}>비밀번호 확인</label>
								<PasswordInput name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호 확인" />
							</div>
						</>
					)}
					{msg && <p style={{ margin: 0, fontSize: '0.88rem', color: '#dc2626' }}>{msg}</p>}
					<button type="submit" style={ls.btnPrimary}>저장</button>
				</form>
			</div>
		</div>
	);
};

/* ───────────────────────────────────────────
   UserPage
─────────────────────────────────────────── */
const UserPage = () => {
	const navigate = useNavigate();
	const [profile, setProfile] = useState(null);
	const [showModal, setShowModal] = useState(false);

	const fetchUserProfile = async () => {
		const accessToken = localStorage.getItem('accessToken');
		if (!accessToken) {
			navigate('/login');
			return;
		}
		try {
			const response = await axios.get(`${API_BASE_URL}/api/user/info`, {
				headers: { 'Authorization': `Bearer ${accessToken}` }
			});
			setProfile(response.data);
		} catch (error) {
			console.error('Failed to fetch user profile:', error);
			if (error.response && error.response.status === 401) {
				navigate('/login');
			}
		}
	};

	useEffect(() => {
		fetchUserProfile();
	}, [navigate]);

	const handleSaveProfile = async (updatedData) => {
		const accessToken = localStorage.getItem('accessToken');
		try {
			await axios.put(`${API_BASE_URL}/api/user/info`, updatedData, {
				headers: { 'Authorization': `Bearer ${accessToken}` }
			});
			// 저장 후 프로필 정보 다시 불러오기
			await fetchUserProfile();
			alert('회원정보가 성공적으로 수정되었습니다.');
		} catch (error) {
			console.error('Failed to update profile:', error);
			alert('정보 수정에 실패했습니다.');
		}
	};

	const maskEmail = (email) => {
		if (!email) return '';
		const [id, domain] = email.split('@');
		return id.slice(0, 2) + '*'.repeat(Math.max(id.length - 2, 3)) + '@' + domain;
	};

	const handleLogout = async () => {
		const accessToken = localStorage.getItem('accessToken');
		if (!accessToken) {
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('nickname');
			navigate('/login');
			return;
		}
		try {
			await axios.post(`${API_BASE_URL}/auth/logout`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` } });
		} catch (error) {
			console.error('Server logout failed, proceeding with client-side logout:', error);
		} finally {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('nickname');
			navigate('/login');
		}
	};

	if (!profile) {
		return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
	}

	return (
		<div style={{ maxWidth: '820px', margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
			<div style={cs.card}>
				<div style={cs.avatar}>{profile.nickname.slice(0, 1)}</div>
				<div style={cs.info}>
					<p style={cs.name}>{profile.nickname}</p>
					<p style={cs.row}><span>{maskEmail(profile.email)}</span></p>
					<p style={cs.row}><span>{profile.phoneNumber || '전화번호 미입력'}</span></p>
					<p style={cs.row}><span>{profile.introduce || '자기소개 미입력'}</span></p>
				</div>
				<button style={cs.editBtn} onClick={() => setShowModal(true)}>수정</button>
			</div>

			<div style={cs.section}>
				<p style={cs.sectionTitle}>
					활동 잔디
					<span style={cs.sectionSub}>
                   &nbsp;· 활동일 <strong>{Object.keys(activityData).length}</strong>일
						&nbsp;/ 총 풀이 <strong>{Object.values(activityData).reduce((a, b) => a + b, 0)}</strong>문제
                </span>
				</p>
				<div style={{ overflowX: 'auto' }}><ActivityGrid data={activityData} /></div>
			</div>

			<div style={cs.section}>
				<p style={cs.sectionTitle}>
					푼 문제 목록
					<span style={cs.sectionSub}>&nbsp;· 총 <strong>{dummyProblems.length}</strong>문제</span>
				</p>
				<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
					<thead>
					<tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
						{['#', '문제명', '난이도', '언어', '풀이일'].map(h => <th key={h} style={{ padding: '8px 12px', color: '#555', fontWeight: '600' }}>{h}</th>)}
					</tr>
					</thead>
					<tbody>
					{dummyProblems.map((p, i) => (
						<tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
							<td style={{ padding: '9px 12px', color: '#999' }}>{i + 1}</td>
							<td style={{ padding: '9px 12px' }}>{p.title}</td>
							<td style={{ padding: '9px 12px' }}><span style={{ color: levelColor[p.level], fontWeight: '500' }}>{p.level}</span></td>
							<td style={{ padding: '9px 12px', color: '#555' }}>{p.language}</td>
							<td style={{ padding: '9px 12px', color: '#888' }}>{p.solvedAt}</td>
						</tr>
					))}
					</tbody>
				</table>
			</div>

			{showModal && (
				<EditProfileModal
					profile={profile}
					isSocial={profile.provider !== 'LOCAL'}
					onSave={handleSaveProfile}
					onClose={() => setShowModal(false)}
				/>
			)}

			<div style={{ marginTop: '30px', textAlign: 'center' }}>
				<button onClick={handleLogout} style={{ padding: '12px 24px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>
					로그아웃
				</button>
			</div>
		</div>
	);
};

/* ───────────────────────────────────────────
   스타일
─────────────────────────────────────────── */
const cs = {
	card: { display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '10px', marginBottom: '20px', flexWrap: 'wrap' },
	avatar: { width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '700', color: '#3730a3', flexShrink: 0 },
	info: { flex: 1, minWidth: '180px' },
	name: { fontSize: '1.2rem', fontWeight: '700', margin: '0 0 8px', color: '#1e293b' },
	row: { margin: '4px 0', color: '#475569', fontSize: '0.9rem' },
	editBtn: { padding: '10px 22px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', flexShrink: 0 },
	section: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px' },
	sectionTitle: { fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 16px' },
	sectionSub: { fontSize: '0.85rem', color: '#888', fontWeight: '400' },
};
const ms = {
	overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
	box: { backgroundColor: '#fff', borderRadius: '10px', padding: '36px 32px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
	closeBtn: { position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#64748b' },
	title: { fontSize: '1.15rem', fontWeight: '600', marginBottom: '20px', color: '#1e293b' },
};
const ls = {
	label: { display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' },
	input: { width: '100%', padding: '9px 11px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' },
	btnPrimary: { width: '100%', padding: '11px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' },
};

export default UserPage;
