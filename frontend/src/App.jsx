import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProblemCreatePage from './pages/ProblemCreatePage';

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/problems" element={<ProblemListPage />} />
				<Route path="/problems/:id" element={<ProblemDetailPage />} />
				<Route path="/admin/problems/new" element={<ProblemCreatePage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
