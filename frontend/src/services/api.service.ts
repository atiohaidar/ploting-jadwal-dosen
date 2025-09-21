import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:3000'; // Adjust this to match your backend URL

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear local storage and redirect to login
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'DOSEN' | 'MAHASISWA' | 'KAPRODI';
    nip?: string;
    nim?: string;
    prodiId?: number;
    prodi?: {
        id: number;
        namaProdi: string;
    };
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'DOSEN' | 'MAHASISWA' | 'KAPRODI';
    nip?: string;
    nim?: string;
    prodiId?: number;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: 'ADMIN' | 'DOSEN' | 'MAHASISWA' | 'KAPRODI';
    nip?: string;
    nim?: string;
    prodiId?: number;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
}

// Auth API
export const authAPI = {
    login: async (loginDto: LoginDto): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', loginDto);
        return response.data;
    },
};

// Users API
export const usersAPI = {
    create: async (userData: CreateUserDto): Promise<User> => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    findAll: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    update: async (id: number, userData: UpdateUserDto): Promise<User> => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    bulkCreate: async (users: CreateUserDto[]): Promise<User[]> => {
        const response = await api.post('/users/bulk', { users });
        return response.data;
    },

    delete: async (id: number): Promise<User> => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export default api;