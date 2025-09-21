import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, CreateUserDto } from '../services/api.service';

const BulkCreateUsers: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<CreateUserDto[]>([
    {
      name: '',
      email: '',
      password: '',
      role: 'MAHASISWA',
      nip: '',
      nim: '',
      prodiId: undefined,
    },
  ]);

  const addUser = () => {
    setUsers([
      ...users,
      {
        name: '',
        email: '',
        password: '',
        role: 'MAHASISWA',
        nip: '',
        nim: '',
        prodiId: undefined,
      },
    ]);
  };

  const removeUser = (index: number) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  const updateUser = (index: number, field: keyof CreateUserDto, value: any) => {
    const updatedUsers = [...users];
    updatedUsers[index] = {
      ...updatedUsers[index],
      [field]: field === 'prodiId' ? (value ? parseInt(value) : undefined) : value,
    };
    setUsers(updatedUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const invalidUsers = users.filter(user => !user.name || !user.email || !user.password);
    if (invalidUsers.length > 0) {
      setError('All users must have name, email, and password');
      return;
    }

    try {
      setLoading(true);
      await usersAPI.bulkCreate(users);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#494949] shadow rounded-lg p-6">
          <h2 className="text-3xl font-bold text-[#BFFF00] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Bulk Create Users
          </h2>
          <p className="mt-2 text-sm text-[#AAAAAA] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Create multiple users at once. All fields are required for each user.
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-900 border border-red-700 p-4">
              <div className="text-sm text-red-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {users.map((user, index) => (
                <div key={index} className="bg-[#525252] p-6 rounded-lg border border-[#656565]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      User {index + 1}
                    </h3>
                    {users.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUser(index)}
                        className="text-red-400 hover:text-red-300"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => updateUser(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) => updateUser(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Password *
                      </label>
                      <input
                        type="password"
                        value={user.password}
                        onChange={(e) => updateUser(index, 'password', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Role
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <option value="MAHASISWA">Mahasiswa</option>
                        <option value="DOSEN">Dosen</option>
                        <option value="KAPRODI">Kaprod</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        NIP (for Dosen/Admin)
                      </label>
                      <input
                        type="text"
                        value={user.nip || ''}
                        onChange={(e) => updateUser(index, 'nip', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        NIM (for Mahasiswa)
                      </label>
                      <input
                        type="text"
                        value={user.nim || ''}
                        onChange={(e) => updateUser(index, 'nim', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#AAAAAA] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Program Studi ID
                      </label>
                      <input
                        type="number"
                        value={user.prodiId || ''}
                        onChange={(e) => updateUser(index, 'prodiId', e.target.value)}
                        className="w-full px-3 py-2 bg-[#494949] border border-[#656565] rounded-md text-[#AAAAAA] focus:ring-[#BFFF00] focus:border-[#BFFF00]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={addUser}
                className="px-4 py-2 bg-[#656565] text-[#AAAAAA] rounded-md hover:bg-[#525252] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Add Another User
              </button>

              <div className="flex space-x-4">
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
                  {loading ? 'Creating Users...' : `Create ${users.length} User${users.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateUsers;
