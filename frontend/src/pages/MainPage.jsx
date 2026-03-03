import React from 'react';
import '../styles/global.css';
import CodeEditor from '../features/ide/CodeEditor'; //ide link test

const MainPage = () => {
	return (
		<div className="container">
			<header style={styles.header}>
				<h1>Coditor System</h1>
				<div className="notification-bell">🔔 알림 (0)</div>
			</header>

			<main style={styles.grid}>
				{/* 회원/랭킹/대시보드 */}
				<section className="card">
					<h2>🏆 실시간 랭킹</h2>
					<p style={styles.placeholder}>랭킹 리스트 컴포넌트</p>
				</section>

				{/* 마이페이지/잔디 */}
				<section className="card">
					<h2>👤 내 학습 현황</h2>
					<p style={styles.placeholder}>사용자 컴포넌트</p>
				</section>

				{/* 문제 리스트/커뮤니티 */}
				<section className="card" style={{ gridColumn: '1 / -1' }}>
					<h2>📋 추천 문제 & 최근 게시글</h2>
					<p style={styles.placeholder}>문제 리스트 필터 및 게시판 테이블</p>
				</section>

				{/* 채점 현황/에디터 진입점 */}
				<section className="card" style={{ gridColumn: '1 / -1' }}>
					<h2>🚀 전체 채점 현황 (대시보드)</h2>
					<p style={styles.placeholder}>Chart.js를 활용한 실시간 제출 현황</p>
				</section>
                
                <section className="card" style={{ gridColumn: '1 / -1' }}>
                    <h2>🚀 코드 에디터 테스트</h2>
                    <CodeEditor />
                </section>
			</main>
		</div>
	);
};

// 임시 인라인 스타일
const styles = {
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 'var(--header-height)',
		marginBottom: '24px',
		borderBottom: '1px solid var(--border-color)',
		paddingBottom: '10px'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: '24px'
	},
	placeholder: {
		color: 'var(--text-secondary)',
		marginTop: '12px',
		fontSize: '0.95rem'
	}
};

export default MainPage;