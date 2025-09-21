import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, User, CreateUserDto, UpdateUserDto } from '../services/api.service';

interface UserFormProps {
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ isEdit = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateUserDto & { confirmPassword?: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MAHASISWA',
    nip: '',
    nim: '',
    prodiId: undefined,
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchUser(parseInt(id));
    }
  }, [isEdit, id]);

  const fetchUser = async (userId: number) => {
    try {
      setFetchLoading(true);
      // Note: We don't have a single user fetch endpoint, so we'll get all users and find the one we need
      const users = await usersAPI.findAll();
      const user = users.find(u => u.id === userId);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: '', // Don't populate password for security
          role: user.role,
          nip: user.nip || '',
          nim: user.nim || '',
          prodiId: user.prodiId,
        });
      } else {
        setError('User not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'prodiId' ? (value ? parseInt(value) : undefined) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    if (!isEdit && (!formData.password || formData.password !== formData.confirmPassword)) {
      setError('Password is required and must match confirmation');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        const updateData: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          nip: formData.nip || undefined,
          nim: formData.nim || undefined,
          prodiId: formData.prodiId,
        };
        await usersAPI.update(parseInt(id), updateData);
      } else {
        const createData: CreateUserDto = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          nip: formData.nip || undefined,
          nim: formData.nim || undefined,
          prodiId: formData.prodiId,
        };
        await usersAPI.create(createData);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222222]">
        <div className="text-lg text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#494949] shadow rounded-lg p-6">
          <h2 className="text-3xl font-bold text-[#BFFF00] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {isEdit ? 'Edit User' : 'Create New User'}
          </h2>

          {error && (
            <div className="mb-4 rounded-md bg-red-900 border border-red-700 p-4">
              <div className="text-sm text-red-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            {!isEdit && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required={!isEdit}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required={!isEdit}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Role
              </label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <option value="MAHASISWA">Mahasiswa</option>
                <option value="DOSEN">Dosen</option>
                <option value="KAPRODI">Kaprod</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                NIP (for Dosen/Admin)
              </label>
              <input
                type="text"
                name="nip"
                id="nip"
                value={formData.nip}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div>
              <label htmlFor="nim" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                NIM (for Mahasiswa)
              </label>
              <input
                type="text"
                name="nim"
                id="nim"
                value={formData.nim}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div>
              <label htmlFor="prodiId" className="block text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Program Studi ID
              </label>
              <input
                type="number"
                name="prodiId"
                id="prodiId"
                value={formData.prodiId || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-[#525252] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-[#656565] rounded-md text-[#AAAAAA] hover:bg-[#525252] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#BFFF00] text-[#222222] rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
