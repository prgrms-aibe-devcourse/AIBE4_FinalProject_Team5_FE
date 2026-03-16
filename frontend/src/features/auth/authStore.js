import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
	persist(
		(set) => ({
			user: null,

			login: (userData) => set({ user: userData }),

			logout: () => {
				set({ user: null });
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('nickname');
				localStorage.removeItem('memberId');
			}
		}),
		{
			name: 'auth-storage',
		}
	)
);
