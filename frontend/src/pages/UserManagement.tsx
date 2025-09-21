import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, User } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await usersAPI.findAll();
      setUsers(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.delete(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#222222]">
        <div className="text-lg text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="bg-[#494949] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              User Management
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/users/create')}
                className="bg-[#BFFF00] text-[#222222] font-semibold px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Add User
              </button>
              <button
                onClick={() => navigate('/users/bulk-create')}
                className="bg-[#656565] text-[#AAAAAA] font-semibold px-4 py-2 rounded-md hover:bg-[#525252] transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Bulk Create
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-900 border border-red-700 p-4">
            <div className="text-sm text-red-200" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-[#494949] shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-4 sm:px-6 border-b border-[#656565]">
            <h2 className="text-xl font-semibold text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>Users</h2>
          </div>
          <ul className="divide-y divide-[#656565]">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#525252] flex items-center justify-center border border-[#656565]">
                          <span className="text-sm font-medium text-[#BFFF00]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[#AAAAAA]" style={{ fontFamily: "'Poppins', sans-serif" }}>{user.name}</div>
                        <div className="text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-[#AAAAAA]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN'
                          ? 'bg-red-900 text-red-200'
                          : user.role === 'DOSEN'
                            ? 'bg-blue-900 text-blue-200'
                            : user.role === 'MAHASISWA'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="text-sm text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {user.nip && <div>NIP: {user.nip}</div>}
                        {user.nim && <div>NIM: {user.nim}</div>}
                        {user.prodi && <div>Prodi: {user.prodi.namaProdi}</div>}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {users.length === 0 && (
            <div className="text-center py-8 text-[#656565]" style={{ fontFamily: "'Inter', sans-serif" }}>
              No users found. <button onClick={() => navigate('/users/create')} className="text-[#BFFF00] hover:underline">Create your first user</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;