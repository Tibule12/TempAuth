"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

// Configure this to point to your FastAPI backend
const API_URL = "http://localhost:8000";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', duration_hours: 24 });
  const [createdUser, setCreatedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/list_active_users`);
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/audit_logs`);
      setLogs(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/create_temp_user`, newUser);
      // Simulate base64 string presence to trigger UI since we generate client-side now
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
      await axios.post(`${API_URL}/revoke_user/${userId}`);
      fetchUsers();
      fetchLogs();
    } catch (e) {
      alert("Error revoking user");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">TempAuth Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Create User Panel */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Create Temporary User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded"
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email (Optional)</label>
              <input 
                type="email" 
                className="w-full border p-2 rounded"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Duration (Hours)</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded"
                value={newUser.duration_hours}
                onChange={e => setNewUser({...newUser, duration_hours: parseInt(e.target.value)})}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {loading ? "Generating..." : "Generate Access"}
            </button>
          </form>

          {createdUser && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-bold text-green-800">User Created!</h3>
              <p>Username: {createdUser.username}</p>
              <p className="text-sm text-gray-600 mb-2">Scan this with the Mobile App:</p>
              {createdUser.qr_code_base64 && (
                 // Removed backend image, using client-side generation
                 <div className="bg-white p-2 w-fit">
                    <QRCodeSVG 
                      value={`otpauth://totp/TempAuth:${createdUser.username}?secret=${createdUser.manual_entry_secret}&issuer=TempAuth`}
                      size={200}
                    />
                 </div>
              )}
              <p className="text-xs text-gray-500 mt-2 break-all">Secret: {createdUser.manual_entry_secret}</p>
            </div>
          )}
        </div>

        {/* Active Users List */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Active Users</h2>
          <div className="overflow-auto max-h-[500px]">
            {users.length === 0 ? (
              <p className="text-gray-500">No active users found.</p>
            ) : (
              <table className="w-full">
                <thead className="text-left bg-gray-100">
                  <tr>
                    <th className="p-2">User</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2 font-medium">{u.username}</td>
                      <td className="p-2 text-sm text-gray-500">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="p-2">
                        <button 
                          onClick={() => handleRevoke(u.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
                        >
                          Revoke
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

      {/* Audit Logs */}
      <div className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
        <div className="overflow-auto max-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Action</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-2 font-mono text-blue-700">{log.action}</td>
                  <td className="p-2">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
