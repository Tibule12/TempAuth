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
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
     <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-indigo-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchUsers();
      fetchLogs();
    }, 30000);
    return () => clearInterval(interval);
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
    setCreatedUser(null);
    try {
      const res = await api.post('/create_temp_user', newUser);
      // Backend returns the secret only once here
      setCreatedUser(res.data);
      fetchUsers();
      fetchLogs();
      // Reset form
      setNewUser({ username: '', email: '', duration_hours: 24 });
    } catch (e) {
      alert("Error creating user. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId: number) => {
    if (!confirm("Are you sure you want to immediately revoke this user's access?")) return;
    try {
      await api.post(`/revoke_user/${userId}`);
      fetchUsers();
      fetchLogs();
    } catch (e) {
      alert("Error revoking user");
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 pb-20">
      
      {/* --- Top Navigation --- */}
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-200/80 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <ShieldCheckIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">TempAuth</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700">Administrator</span>
                <span className="text-xs text-slate-400">logged in</span>
             </div>
             <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                AD
             </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Hero Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             {/* Stat Card 1 */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                   <p className="text-sm font-medium text-slate-500 mb-1">Active Sessions</p>
                   <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <UsersIcon />
                </div>
             </div>
             
             {/* Stat Card 2 */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div>
                   <p className="text-sm font-medium text-slate-500 mb-1">Total Audit Logs</p>
                   <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{logs.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ClockIcon />
                </div>
             </div>

             {/* Stat Card 3 */}
             <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-xl shadow-lg shadow-indigo-200 text-white flex flex-col justify-center">
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">System Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                  <p className="text-xl font-bold">Operational</p>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (Main Actions) --- */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Generator Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                 <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
                    <PlusIcon />
                 </div>
                 <h2 className="font-semibold text-slate-800">Generate New Token</h2>
              </div>
              
              <div className="p-6">
                 <form onSubmit={handleCreateUser}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">User Reference</label>
                            <input 
                              type="text" 
                              required
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                              placeholder="e.g. Employee ID or Name"
                              value={newUser.username}
                              onChange={e => setNewUser({...newUser, username: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Duration (Hours)</label>
                            <input 
                              type="number" 
                              min="1"
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                              value={newUser.duration_hours}
                              onChange={e => setNewUser({...newUser, duration_hours: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-white shadow-md shadow-indigo-100 transition-all 
                        ${loading ? 'bg-slate-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'}
                      `}
                    >
                      {loading ? (
                        <span>Processing...</span>
                      ) : (
                        <>Create Secure Access Key</>
                      )}
                    </button>
                 </form>

                 {/* Success State - Modal/Inline */}
                 {createdUser && (
                    <div className="mt-8 bg-emerald-50/80 border border-emerald-100 rounded-xl p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                             </svg>
                          </div>
                          <div>
                             <h3 className="font-bold text-emerald-900">User Created Successfully</h3>
                             <p className="text-xs text-emerald-700">The access token is ready for distribution.</p>
                          </div>
                       </div>

                       <div className="flex flex-col md:flex-row gap-8">
                          {/* QR Code */}
                          <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm w-fit">
                             <QRCodeSVG 
                                value={`otpauth://totp/TempAuth:${createdUser.username}?secret=${createdUser.manual_entry_secret}&issuer=TempAuth`}
                                size={128}
                             />
                          </div>

                          {/* Text Details */}
                          <div className="flex-1 space-y-4">
                             <div>
                                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Manual Entry Key</label>
                                <div className="group relative">
                                    <div className="font-mono text-base bg-white border-2 border-emerald-100 text-emerald-800 px-4 py-3 rounded-lg w-full break-all select-all">{createdUser.manual_entry_secret}</div>
                                </div>
                             </div>
                             <div className="text-xs text-emerald-700 leading-relaxed">
                                Share this <strong>Secret Key</strong> or <strong>QR Code</strong> with the user immediately. They will use the mobile app to scan or enter it.
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                     Active Users <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{users.length}</span>
                  </h2>
                  
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                           <th className="px-6 py-3">Identity</th>
                           <th className="px-6 py-3">Granted At</th>
                           <th className="px-6 py-3">Status</th>
                           <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {users.length === 0 ? (
                           <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                                 No active users found. Create one above.
                              </td>
                           </tr>
                        ) : (
                           users.map((u: any) => (
                              <tr key={u.id} className="group hover:bg-slate-50/80 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                          {u.username.substring(0,2).toUpperCase()}
                                       </div>
                                       <div>
                                          <p className="text-sm font-medium text-slate-900">{u.username}</p>
                                          <p className="text-xs text-slate-400">{u.email || ""}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">
                                    {new Date(u.created_at).toLocaleDateString()} <span className="text-slate-300">|</span> {new Date(u.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                       Active
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button 
                                       onClick={() => handleRevoke(u.id)}
                                       className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                       title="Revoke Access"
                                    >
                                       <TrashIcon />
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (Feed) --- */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Activity Log</h3>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-0">
                   {logs.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">No activity yet.</div>
                   ) : (
                      <div className="relative">
                         {/* Timeline line */}
                         <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100"></div>
                         
                         {logs.map((log: any, idx) => (
                            <div key={log.id} className="relative pl-10 pr-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                               {/* Dot */}
                               <div className={`absolute left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 
                                  ${log.action.includes('REVOKE') ? 'bg-red-500' : 'bg-blue-500'}
                               `}></div>
                               
                               <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                     {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-700">
                                     {log.action.replace('_', ' ')}
                                  </span>
                                  <p className="text-xs text-slate-500 leading-snug">
                                     {log.details}
                                  </p>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

