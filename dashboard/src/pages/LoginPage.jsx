import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Ensure the import name matches the file name exactly (case-sensitive!)
import Image from "../assets/restaurant-image.jpg"; 

// --- Static User Credentials ---
const USERS = [
  { username: "manager", password: "123", role: "manager", homepage: "/main/dashboard" },
  { username: "cashier1", password: "123", role: "cashier", homepage: "/cashier" },
  { username: "waiter1", password: "123", role: "waiter", homepage: "/waiter" },
  { username: "kitchen1", password: "123", role: "kitchen", homepage: "/kitchen" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      navigate(user.homepage);
    } else {
      setLoginError("Invalid credentials. Please try again.");
      setPassword(""); 
    }
  };

  return (
    // UPDATED CONTAINER: Removed 'bg-gray-50' to avoid gaps, ensured w-full h-screen
    <div className="min-h-screen w-full flex">
      
      {/* LEFT SIDE: Branding & Image */}
      {/* Changed to 'flex-1' so it takes all available space left by the form */}
      <div className="hidden md:flex flex-1 relative bg-gray-900 justify-center items-center overflow-hidden">
        {/* Background Image */}
        <img 
            src={Image}
            alt="Ambrosia Restaurant" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        
        {/* Overlay Content */}
        <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
                Ambrosia
            </h1>
            <p className="text-xl text-gray-200 font-light tracking-widest uppercase border-t border-b border-gray-400 py-2 inline-block">
                Restaurant Management System
            </p>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      {/* Fixed width (w-full on mobile, fixed standard width on desktop) prevents stretching weirdly */}
      <div className="w-full md:w-[480px] lg:w-[500px] flex flex-col justify-center items-center p-8 sm:p-12 relative shadow-2xl z-20 bg-white shrink-0">
        
        <div className="w-full max-w-sm">
            {/* Mobile-only Branding Title */}
            <div className="md:hidden text-center mb-10">
                 <h1 className="text-4xl font-bold text-gray-800">Ambrosia</h1>
                 <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">System Login</p>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-2">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {loginError && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {loginError}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. manager"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3.5 rounded-lg text-white font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    style={{ backgroundColor: 'var(--color-accent-utility)' }}
                >
                    Sign In
                </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400">
                &copy; 2024 Ambrosia Systems. All rights reserved.
            </div>
        </div>
      </div>
    </div>
  );
}