import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";
import { LayoutDashboard, Loader2, ArrowRight } from "lucide-react";

export default function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", inviteToken: token });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }
    
    // Validate token exists in backend
    api.get(`/invites/${token}`)
      .then(() => {
        setTokenValid(true);
      })
      .catch((err) => {
        console.error("Token verification failed", err);
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/register", formData);
      localStorage.setItem("crm_user", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-100">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500 mb-4" />
        <p className="text-zinc-500 font-medium">Verifying standard encryption payload...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-100 px-4 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-red-500/10 mb-6">
           <div className="text-red-500 text-6xl">🔒</div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Unauthorized Access</h2>
        <p className="text-zinc-400 mb-6 max-w-md">Your invite link is either invalid, missing, or has already expired. Public registration is strictly disabled on this platform.</p>
        <Link to="/login" className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-lg hover:text-white transition-colors">Return to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-zinc-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl mb-6">
          <LayoutDashboard className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Create Your Account</h2>
        <p className="mt-2 text-sm text-green-400 font-medium">Invite Token Verified Successfully</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800/60">
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Name</label>
              <div className="mt-1">
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 placeholder-zinc-500 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm text-white"
                  placeholder="John Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Email address</label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 placeholder-zinc-500 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm text-white"
                  placeholder="name@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">Choose Password</label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 placeholder-zinc-500 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm text-white"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full justify-center items-center gap-2 rounded-lg border border-transparent bg-brand-600 py-2.5 px-4 text-sm font-medium text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  Create Account Securely
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
