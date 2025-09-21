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

export interface Prodi {
    id: number;
    namaProdi: string;
    users: User[];
    kelas: Kelas[];
    mataKuliah: MataKuliah[];
}

export interface MataKuliah {
    id: number;
    kodeMk: string;
    namaMk: string;
    sks: number;
    prodiId: number;
    prodi: Prodi;
    Jadwal: Jadwal[];
}

export interface Kelas {
    id: number;
    namaKelas: string;
    angkatan: number;
    prodiId: number;
    prodi: Prodi;
    Jadwal: Jadwal[];
}

export interface Ruangan {
    id: number;
    nama: string;
    kapasitas: number;
    lokasi?: string;
    Jadwal: Jadwal[];
}

export interface Jadwal {
    id: number;
    hari: string;
    jamMulai: Date;
    jamSelesai: Date;
    status: string;
    mataKuliahId: number;
    dosenId: number;
    kelasId: number;
    ruanganId: number;
    mataKuliah: MataKuliah;
    dosen: User;
    kelas: Kelas;
    ruangan: Ruangan;
    PermintaanJadwal: PermintaanJadwal[];
}

export interface PermintaanJadwal {
    id: number;
    alasan: string;
    tanggalPengajuan: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    jadwalId: number;
    jadwal: Jadwal;
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

export interface CreateProdiDto {
    namaProdi: string;
}

export interface UpdateProdiDto {
    namaProdi?: string;
}

export interface CreateMataKuliahDto {
    kodeMk: string;
    namaMk: string;
    sks: number;
    prodiId: number;
}

export interface UpdateMataKuliahDto {
    kodeMk?: string;
    namaMk?: string;
    sks?: number;
    prodiId?: number;
}

export interface CreateKelasDto {
    namaKelas: string;
    angkatan: number;
    prodiId: number;
}

export interface UpdateKelasDto {
    namaKelas?: string;
    angkatan?: number;
    prodiId?: number;
}

export interface CreateRuanganDto {
    nama: string;
    kapasitas: number;
    lokasi?: string;
}

export interface UpdateRuanganDto {
    nama?: string;
    kapasitas?: number;
    lokasi?: string;
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

// Prodi API
export const prodiAPI = {
    create: async (prodiData: CreateProdiDto): Promise<Prodi> => {
        const response = await api.post('/prodi', prodiData);
        return response.data;
    },

    findAll: async (): Promise<Prodi[]> => {
        const response = await api.get('/prodi');
        return response.data;
    },

    update: async (id: number, prodiData: UpdateProdiDto): Promise<Prodi> => {
        const response = await api.put(`/prodi/${id}`, prodiData);
        return response.data;
    },

    delete: async (id: number): Promise<Prodi> => {
        const response = await api.delete(`/prodi/${id}`);
        return response.data;
    },
};

// Mata Kuliah API
export const mataKuliahAPI = {
    create: async (mataKuliahData: CreateMataKuliahDto): Promise<MataKuliah> => {
        const response = await api.post('/mata-kuliah', mataKuliahData);
        return response.data;
    },

    findAll: async (): Promise<MataKuliah[]> => {
        const response = await api.get('/mata-kuliah');
        return response.data;
    },

    update: async (id: number, mataKuliahData: UpdateMataKuliahDto): Promise<MataKuliah> => {
        const response = await api.put(`/mata-kuliah/${id}`, mataKuliahData);
        return response.data;
    },

    delete: async (id: number): Promise<MataKuliah> => {
        const response = await api.delete(`/mata-kuliah/${id}`);
        return response.data;
    },
};

// Kelas API
export const kelasAPI = {
    create: async (kelasData: CreateKelasDto): Promise<Kelas> => {
        const response = await api.post('/kelas', kelasData);
        return response.data;
    },

    findAll: async (): Promise<Kelas[]> => {
        const response = await api.get('/kelas');
        return response.data;
    },

    update: async (id: number, kelasData: UpdateKelasDto): Promise<Kelas> => {
        const response = await api.put(`/kelas/${id}`, kelasData);
        return response.data;
    },

    delete: async (id: number): Promise<Kelas> => {
        const response = await api.delete(`/kelas/${id}`);
        return response.data;
    },
};

// Ruangan API
export const ruanganAPI = {
    create: async (ruanganData: CreateRuanganDto): Promise<Ruangan> => {
        const response = await api.post('/ruangan', ruanganData);
        return response.data;
    },

    findAll: async (): Promise<Ruangan[]> => {
        const response = await api.get('/ruangan');
        return response.data;
    },

    update: async (id: number, ruanganData: UpdateRuanganDto): Promise<Ruangan> => {
        const response = await api.put(`/ruangan/${id}`, ruanganData);
        return response.data;
    },

    delete: async (id: number): Promise<Ruangan> => {
        const response = await api.delete(`/ruangan/${id}`);
        return response.data;
    },
};

export default api;