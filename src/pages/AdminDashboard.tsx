import React, { useState } from 'react';
import { ShieldAlert, Users, Trash2, Search, UserCheck, Activity, Plus, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

// Dummy users to simulate admin functionality
const initialDummyUsers = [
  { id: 101, name: 'Rahul Sharma', email: 'rahul.s@example.com', portfolioValue: 1250000, status: 'Active', joined: '2023-05-12' },
  { id: 102, name: 'Priya Patel', email: 'priya.p@example.com', portfolioValue: 840000, status: 'Active', joined: '2023-08-22' },
  { id: 103, name: 'Vikram Singh', email: 'vikram.s@example.com', portfolioValue: 3200000, status: 'Suspended', joined: '2022-11-05' },
  { id: 104, name: 'Neha Gupta', email: 'neha.g@example.com', portfolioValue: 450000, status: 'Active', joined: '2024-01-15' },
];

const AdminDashboard: React.FC = () => {
  const { user, totalPortfolioValue } = usePortfolio();
  
  // Combine logged-in user with dummy users
  const [users, setUsers] = useState([
    { 
      id: 999, 
      name: user?.name || 'Current User', 
      email: user?.email || 'user@wealthos.com', 
      portfolioValue: totalPortfolioValue, 
      status: 'Active (You)', 
      joined: 'Today' 
    },
    ...initialDummyUsers
  ]);

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', portfolioValue: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    
    setUsers(prev => [
      ...prev,
      {
        id: Math.floor(Math.random() * 10000) + 200,
        name: newUser.name,
        email: newUser.email,
        portfolioValue: parseFloat(newUser.portfolioValue) || 0,
        status: 'Active',
        joined: 'Just now'
      }
    ]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', portfolioValue: '' });
  };

  const handleDelete = (id: number) => {
    if (id === 999) {
      alert("You cannot delete the active session user!");
      return;
    }
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 p-6 flex flex-col font-inter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Admin Console</h1>
          <p className="text-xs text-zinc-500">System Administration & User Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#141413] border border-[#27272A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">Total Users</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{users.length}</div>
        </div>
        <div className="bg-[#141413] border border-[#27272A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">Total AUM (Platform)</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">
            ₹{(users.reduce((acc, u) => acc + u.portfolioValue, 0) / 100000).toFixed(2)}L
          </div>
        </div>
        <div className="bg-[#141413] border border-[#27272A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase">Active Sessions</span>
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">1</div>
        </div>
      </div>

      <div className="bg-[#141413] border border-[#27272A] rounded-2xl flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#27272A] flex justify-between items-center bg-[#0D0D0F]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registered Users</h2>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-purple-500/50"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09090B] border-b border-[#27272A]">
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Portfolio Value</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-[#27272A]/50 hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-zinc-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-zinc-300">₹{u.portfolioValue.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-zinc-400">{u.joined}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      u.status.includes('Active') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/30"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 text-xs">
                    No users found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141413] border border-[#27272A] rounded-2xl p-6 w-full max-w-md relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Initial Portfolio Value (₹)</label>
                <input
                  type="number"
                  value={newUser.portfolioValue}
                  onChange={e => setNewUser({...newUser, portfolioValue: e.target.value})}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
