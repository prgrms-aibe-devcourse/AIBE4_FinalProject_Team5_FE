import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProblemCreatePage from './pages/ProblemCreatePage';
import ProblemEditPage from './pages/ProblemEditPage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostFormPage from "./pages/PostFormPage.jsx";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/problems" element={<ProblemListPage />} />
				<Route path="/problems/:id" element={<ProblemDetailPage />} />
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
