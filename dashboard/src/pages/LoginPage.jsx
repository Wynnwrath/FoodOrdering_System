import { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Static User Credentials ---
const USERS = [
  { 
    username: "manager", 
    password: "123", 
    role: "manager", 
    homepage: "/main/dashboard" 
  },
  { 
    username: "cashier1", 
    password: "123", 
    role: "cashier", 
    homepage: "/cashier" 
  },
  { 
    username: "waiter1", 
    password: "123", 
    role: "waiter", 
    homepage: "/waiter" 
  },
  { 
    username: "kitchen1", 
    password: "123", 
    role: "kitchen", 
    homepage: "/kitchen" 
  },
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
      setLoginError("Invalid username or password. Please try again.");
      setPassword(""); 
    }
  };

  return (
    <div 
        className="h-screen w-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-xl shadow-2xl w-80"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">POS Login</h2>

        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {loginError}
          </div>
        )}

        <input
          type="text"
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 transition"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 transition"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition shadow-md"
          style={{ backgroundColor: 'var(--color-accent-utility)' }}
        >
          Sign In
        </button> 
      </form>
    </div>
  );
}