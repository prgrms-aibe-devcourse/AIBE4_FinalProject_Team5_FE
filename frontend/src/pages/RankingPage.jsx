import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import '../styles/global.css';

// 백엔드 API 주소 (환경에 맞게 수정 필요)

// ── 포디움 카드 ───────────────────────────────────────────────
const PodiumCard = ({ user, position }) => {
	const podiumHeights = { 1: 110, 2: 80, 3: 65 };
	const avatarSizes   = { 1: 52,  2: 44, 3: 40  };
	const medals        = { 1: '🥇', 2: '🥈', 3: '🥉' };
	const podiumColors  = {
		1: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
		2: 'linear-gradient(180deg, #94a3b8 0%, #64748b 100%)',
		3: 'linear-gradient(180deg, #cd7f32 0%, #92400e 100%)',
	};
	const glows = { 1: '#fbbf2444', 2: '#94a3b844', 3: '#cd7f3244' };

	return (
		<div style={{ ...styles.podiumWrap, order: position === 1 ? 0 : position === 2 ? -1 : 1 }}>
			<div style={{
				width: avatarSizes[position], height: avatarSizes[position],
				borderRadius: '50%',
				background: podiumColors[position],
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				fontSize: position === 1 ? '1.4rem' : '1.1rem',
				marginBottom: 8,
				boxShadow: `0 0 18px ${glows[position]}`,
			}}>
				{medals[position]}
			</div>
			<div style={{ fontWeight: 700, fontSize: position === 1 ? '0.95rem' : '0.85rem', marginBottom: 2 }}>
				{user.nickname}
			</div>
			<div style={{ color: 'var(--text-secondary)', fontSize: '0.73rem', marginBottom: 10, maxWidth: 110, textAlign: 'center', lineHeight: 1.4 }}>
				{user.introduce || '-'}
			</div>
			<div style={{
				width: position === 1 ? 80 : 64,
				height: podiumHeights[position],
				background: podiumColors[position],
				borderRadius: '8px 8px 0 0',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				fontWeight: 800, fontSize: position === 1 ? '1.6rem' : '1.3rem', color: '#fff',
				boxShadow: `0 -4px 20px ${glows[position]}`,
			}}>
				{user.rank}
			</div>
		</div>
	);
};

// ── 메인 페이지 ───────────────────────────────────────────────
const RankingPage = () => {
	const [hoveredRow, setHoveredRow] = useState(null);
	const [rankingData, setRankingData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRanking = async () => {
			try {
				const response = await api.get('/api/ranking');
                setRankingData(response.data);
			} catch (error) {
				console.error('Failed to fetch ranking data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRanking();
	}, []);

	// 상위 3명 (포디움용)
	const top3 = rankingData.slice(0, 3);

	if (loading) {
		return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
	}

	return (
		<div className="container">

			{/* ── 헤더 ── */}
			<header style={styles.header}>
				<div>
					<h1 style={styles.title}>🏆 실시간 랭킹</h1>
				</div>
			</header>

			{/* ── 포디움 (Top 3) ── */}
			{top3.length > 0 && (
				<section className="card" style={styles.podiumSection}>
					<h2 style={styles.sectionTitle}>🎖️ 상위 3인</h2>
					<div style={styles.podiumRow}>
						{top3.map((u, index) => (
							<PodiumCard key={u.userId} user={u} position={index + 1} />
						))}
					</div>
				</section>
			)}

			{/* ── 랭킹 테이블 ── */}
			<section className="card" style={{ marginTop: 24 }}>
				<div style={styles.tableHeader}>
					<h2 style={styles.sectionTitle}>전체 순위</h2>
				</div>

				{/* 헤더 행 */}
				<div style={styles.tableHead}>
					<span style={styles.colRankHead}>순위</span>
					<span style={styles.colUserHead}>사용자명</span>
					<span style={styles.colBioHead}>소개</span>
					<span style={styles.colSolvedHead}>푼 문제</span>
				</div>

				{/* 데이터 행 (전체 랭킹 데이터를 사용하도록 수정) */}
				{rankingData.length > 0 ? (
					rankingData.map(user => (
						<div
							key={user.userId}
							style={{
								...styles.tableRow,
								background: hoveredRow === user.userId ? 'rgba(0,0,0,0.035)' : 'transparent',
							}}
							onMouseEnter={() => setHoveredRow(user.userId)}
							onMouseLeave={() => setHoveredRow(null)}
						>
							<span style={styles.colRank}>
							  <span style={styles.rankNum}>{user.rank}</span>
							</span>
							<span style={styles.colUser}>
							  <span style={styles.handleText}>{user.nickname}</span>
							</span>
							<span style={styles.colBio}>
							  <span style={styles.bioText}>{user.introduce || '-'}</span>
							</span>
							<span style={styles.colSolved}>
							  <span style={styles.solvedBadge}>{user.solvedCount}문제</span>
							</span>
						</div>
					))
				) : (
					<div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
						랭킹 데이터가 없습니다.
					</div>
				)}
			</section>

		</div>
	);
};

// ── 스타일 ────────────────────────────────────────────────────
const styles = {
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 24,
		borderBottom: '1px solid var(--border-color)',
		paddingBottom: 16,
	},
	title: {
		fontSize: '1.6rem',
		fontWeight: 800,
		letterSpacing: '-0.02em',
		color: 'var(--text-primary)',
		lineHeight: 1.2,
	},
	subtitle: {
		color: 'var(--text-secondary)',
		fontSize: '0.85rem',
		marginTop: 4,
	},

	/* 포디움 */
	podiumSection: { textAlign: 'center' },
	podiumRow: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-end',
		gap: 16,
		marginTop: 24,
		paddingBottom: 4,
	},
	podiumWrap: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},

	/* 테이블 공통 */
	tableHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	updateBadge: {
		fontSize: '0.72rem',
		color: '#16a34a',
		background: 'rgba(22,163,74,0.1)',
		border: '1px solid rgba(22,163,74,0.2)',
		borderRadius: 20,
		padding: '2px 10px',
		fontWeight: 600,
	},

	/* 헤더 행 */
	tableHead: {
		display: 'grid',
		gridTemplateColumns: '52px 160px 1fr 100px',
		padding: '8px 12px',
		borderRadius: 8,
		background: 'rgba(0,0,0,0.04)',
		marginBottom: 4,
		fontSize: '0.75rem',
		fontWeight: 700,
		color: 'var(--text-secondary)',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
	},
	colRankHead:  { display: 'flex', alignItems: 'center' },
	colUserHead:  { display: 'flex', alignItems: 'center' },
	colBioHead:   { display: 'flex', alignItems: 'center' },
	colSolvedHead:{ display: 'flex', alignItems: 'center', justifyContent: 'center' },

	/* 데이터 행 */
	tableRow: {
		display: 'grid',
		gridTemplateColumns: '52px 160px 1fr 100px',
		padding: '11px 12px',
		borderRadius: 8,
		borderBottom: '1px solid var(--border-color)',
		alignItems: 'center',
		transition: 'background 0.12s',
		cursor: 'default',
	},
	colRank:  { display: 'flex', alignItems: 'center' },
	colUser:  { display: 'flex', alignItems: 'center' },
	colBio:   { display: 'flex', alignItems: 'center', paddingRight: 16 },
	colSolved:{ display: 'flex', alignItems: 'center', justifyContent: 'center' },

	rankNum: {
		fontWeight: 700,
		fontSize: '0.9rem',
		color: 'var(--text-secondary)',
		minWidth: 24,
		textAlign: 'center',
	},
	handleText: {
		fontWeight: 600,
		fontSize: '0.88rem',
		color: 'var(--text-primary)',
	},
	bioText: {
		fontSize: '0.82rem',
		color: 'var(--text-secondary)',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	solvedBadge: {
		fontSize: '0.8rem',
		fontWeight: 700,
		color: 'var(--text-primary)',
		background: 'rgba(0,0,0,0.05)',
		borderRadius: 12,
		padding: '3px 10px',
		border: '1px solid var(--border-color)',
	},

	sectionTitle: {
		fontSize: '1rem',
		fontWeight: 700,
		color: 'var(--text-primary)',
	},
};

export default RankingPage;
