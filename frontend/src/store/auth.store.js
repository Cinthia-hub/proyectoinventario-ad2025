import { defineStore } from 'pinia';
import axios from 'axios'; 

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),
    actions: {
        async login(credentials) {
        // Ajusta la URL a tu puerto del backend (3000 o el que uses)
        const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
        
        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        
        // Guardar en LocalStorage para persistencia
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        },
        
        logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        },

        updateUser(newUserData) {
            this.user = { ...this.user, ...newUserData };
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    }
});
