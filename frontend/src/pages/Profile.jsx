import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Mail, KeyRound, Wallet } from 'lucide-react';
import { ethers } from 'ethers';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../lib/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [passwords, setPasswords] = useState({ current: '', new: '' });
    const [pwdStatus, setPwdStatus] = useState({ loading: false, error: '', success: '' });
    const [walletLoading, setWalletLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/employees/me');
                setProfile(res.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleConnectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask or another Web3 wallet.");
            return;
        }
        setWalletLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            await api.put('/employees/me/wallet', { walletAddress: address });
            setProfile(prev => ({ ...prev, walletAddress: address }));
        } catch (error) {
            console.error(error);
            alert("Failed to connect wallet.");
        } finally {
            setWalletLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdStatus({ loading: true, error: '', success: '' });

        try {
            await api.put('/employees/me/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setPwdStatus({ loading: false, error: '', success: 'Password updated successfully!' });
            setPasswords({ current: '', new: '' });
            setTimeout(() => setPwdStatus(s => ({ ...s, success: '' })), 3000);
        } catch (error) {
            setPwdStatus({ loading: false, error: error.response?.data?.error || 'Failed to update password', success: '' });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-slate-500 mt-1">View your personal information and skills</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row gap-8"
            >
                <div className="flex flex-col items-center md:items-start md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 pb-8 md:pb-0 md:pr-8">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <User className="w-16 h-16" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{profile?.name}</h2>
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium mt-3 border border-slate-200">
                        {profile?.role || profile?.profileType}
                    </span>
                </div>

                <div className="flex-1 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h3>
                        <div className="flex items-center text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Mail className="w-5 h-5 mr-3 text-slate-400" />
                            {profile?.email || profile?.adminEmail}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Work Details</h3>
                        <div className="flex items-center text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Briefcase className="w-5 h-5 mr-3 text-slate-400" />
                            {profile?.department || 'Not Assigned'}
                        </div>
                    </div>

                    {profile?.profileType !== 'Admin' && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Web3 Wallet</h3>
                            <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center">
                                    <Wallet className="w-5 h-5 mr-3 text-slate-400" />
                                    {profile?.walletAddress ? (
                                        <span className="font-mono text-sm font-medium">{profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}</span>
                                    ) : (
                                        <span className="text-sm text-slate-500">Not Connected</span>
                                    )}
                                </div>
                                {!profile?.walletAddress && (
                                    <Button onClick={handleConnectWallet} disabled={walletLoading} className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white shrink-0 ml-4">
                                        {walletLoading ? 'Connecting...' : 'Connect MetaMask'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {profile?.skills && profile.skills.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 mt-6 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                                <KeyRound className="w-4 h-4 mr-2 text-slate-500" />
                                Security Settings
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-8 text-xs px-3 border-slate-200 text-slate-600 hover:bg-slate-50"
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                            >
                                {showPasswordForm ? 'Cancel' : 'Change Password'}
                            </Button>
                        </div>

                        {showPasswordForm && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                {pwdStatus.error && <p className="text-sm text-red-500 mb-3 bg-red-50 p-2 rounded">{pwdStatus.error}</p>}
                                {pwdStatus.success && <p className="text-sm text-emerald-600 mb-3 bg-emerald-50 p-2 rounded">{pwdStatus.success}</p>}

                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Current Password</label>
                                        <Input
                                            type="password"
                                            required
                                            className="h-9"
                                            value={passwords.current}
                                            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">New Password</label>
                                        <Input
                                            type="password"
                                            required
                                            className="h-9"
                                            value={passwords.new}
                                            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" disabled={pwdStatus.loading} className="w-full text-sm h-9 bg-slate-800 hover:bg-slate-700">
                                        {pwdStatus.loading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
