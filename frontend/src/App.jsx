import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import LoginPage from './pages/LoginPage.jsx';
import UserPage from './pages/UserPage.jsx';
import ProblemCreatePage from './pages/ProblemCreatePage';
import ProblemEditPage from './pages/ProblemEditPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostFormPage from "./pages/PostFormPage.jsx";


// 1. 토큰을 감시하고 저장하는 별도의 핸들러 컴포넌트
const AuthHandler = () => {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const accessToken = params.get('accessToken');
		const refreshToken = params.get('refreshToken');
		const error = params.get('error');

		if (accessToken && refreshToken) {
			// 로컬 스토리지에 토큰 저장
			localStorage.setItem('accessToken', accessToken);
			localStorage.setItem('refreshToken', refreshToken);

			console.log('소셜 로그인 성공: 토큰이 저장되었습니다.');

			// URL에서 토큰 파라미터를 지우고 유저 페이지로 이동
			navigate('/UserPage', { replace: true });
		} else if (error) {
			alert(`로그인 실패: ${decodeURIComponent(error)}`);
			navigate('/login', { replace: true });
		}
	}, [location, navigate]);

	return null; // 화면에 아무것도 그리지 않음
};

const App = () => {
	return (
		<BrowserRouter>
			{/* 2. 모든 라우트 상단에서 AuthHandler가 동작하도록 배치 */}
			<AuthHandler />

			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/problems" element={<ProblemListPage />} />
				<Route path="/problems/:id" element={<ProblemDetailPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/userpage" element={<UserPage />} />
				<Route path="/admin/problems/new" element={<ProblemCreatePage />} />
				<Route path="/admin/problems/:id/edit" element={<ProblemEditPage />} />
				<Route path="/community" element={<PostListPage />} />
				<Route path="/posts/:id" element={<PostDetailPage />} />
				<Route path="/posts/new" element={<PostFormPage />} />
				<Route path="/posts/edit/:id" element={<PostFormPage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
