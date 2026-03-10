import { create } from 'zustand';

// 임시 로그인 상태
export const useAuthStore = create((set) => ({
	user: {
		memberId: 1,
		nickname: "테스트관리자",
		role: "ADMIN"
	},

	login: (userData) => set({ user: userData }),
	logout: () => set({ user: null })
}));
