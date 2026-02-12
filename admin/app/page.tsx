"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

// Configure this to point to your FastAPI backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "dev_secret_key_123";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "X-API-Key": API_KEY
    }
});

// --- Icons ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
     <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', duration_hours: 24 });
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/list_active_users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit_logs');
      setLogs(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/create_temp_user', newUser);
      res.data.qr_code_base64 = "client-side-generated"; 
      setCreatedUser(res.data);
      fetchUsers();
      fetchLogs();
    } catch (e) {
      alert("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId: number) => {
    if (!confirm("Are you sure you want to revoke access?")) return;
    try {
      await api.post(`/revoke_user/${userId}`);
      fetchUsers();
      fetchLogs();
    } catch (e) {
      alert("Error revoking user");
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldIcon />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
              TempAuth <span className="text-slate-400 font-medium text-sm">/ Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Operational
             </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto p-6 mt-8">
        
        {/* Intro Stats (Mock) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-slate-500 text-sm font-medium mb-1">Active Sessions</div>
                <div className="text-3xl font-bold text-slate-800">{users.length}</div>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-slate-500 text-sm font-medium mb-1">Total Actions</div>
                <div className="text-3xl font-bold text-slate-800">{logs.length}</div>
             </div>
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-blue-100 text-sm font-medium mb-1">System Status</div>
                <div className="text-3xl font-bold">Secure</div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Create & Active */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Create User Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-semibold flex items-center gap-2">
                   <UserIcon /> New Access Grant
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={newUser.username}
                      onChange={e => setNewUser({...newUser, username: e.target.value})}
                      placeholder="e.g. john.doe"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration (Hours)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={newUser.duration_hours}
                      onChange={e => setNewUser({...newUser, duration_hours: parseInt(e.target.value)})}
                    />
                  </div>
                   <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email (Optional)</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="john@example.com"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all 
                        ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.99]'}
                      `}
                    >
                      {loading ? "Generating Keys..." : "Generate Secure Access"}
                    </button>
                  </div>
                </form>

                {/* Result Block */}
                {createdUser && (
                  <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100 flex-shrink-0">
                        <QRCodeSVG 
                          value={`otpauth://totp/TempAuth:${createdUser.username}?secret=${createdUser.manual_entry_secret}&issuer=TempAuth`}
                          size={140}
                        />
                     </div>
                     <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-emerald-900">Access Granted Successfully</h3>
                          <p className="text-emerald-700 text-sm">User {createdUser.username} is now active.</p>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-emerald-600 uppercase">Secret Key (Manual Entry)</label>
                          <div className="font-mono text-sm bg-white border border-emerald-200 px-3 py-2 rounded text-emerald-800 break-all select-all cursor-pointer hover:border-emerald-400 transition-colors">
                            {createdUser.manual_entry_secret}
                          </div>
                        </div>
                        <p className="text-xs text-emerald-600/80">
                           Scan the QR code or enter the key manually in the app.
                        </p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Users List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                   <LockIcon /> Active Users
                </h2>
              </div>
              <div className="overflow-x-auto">
                {users.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No active sessions found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Created At</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {u.username.substring(0,2).toUpperCase()}
                              </div>
                              {u.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleRevoke(u.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                            >
                              Revoke Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Audit Logs */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-slate-50">
                 <h2 className="font-semibold flex items-center gap-2">
                   <ClockIcon /> Audit Logs
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                 <div className="divide-y divide-slate-50/50">
                    {logs.map((log: any) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                         <div className="flex items-start gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${log.action.includes('REVOKE') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div>
                               <p className="text-xs font-bold text-slate-400 mb-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                               <p className="text-sm font-medium text-slate-700">{log.action}</p>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">{log.details}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                    {logs.length === 0 && <div className="p-4 text-center text-slate-400 text-sm">No activity logged.</div>}
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

