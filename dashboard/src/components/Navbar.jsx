import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false); 

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to log out?")) {
            navigate('/login');
        }
    };

    const navLinks = [
        { name: "Dashboard", path: "/main/dashboard" },
        { name: "Waiter",    path: "/main/waiter" },
        { name: "Cashier",   path: "/main/cashier" },
        { name: "Kitchen",   path: "/main/kitchen" },
        { name: "Manager",   path: "/main/manager" },
    ];

    return (
        <nav 
            className="w-full shadow-md z-50"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/main/dashboard')}>
                        <h1 className="text-xl font-bold tracking-tight text-gray-800">
                            Ambrosia <span style={{ color: 'var(--color-accent-utility)' }}>System</span>
                        </h1>
                    </div>
                    
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => navigate(link.path)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive ? "shadow-sm" : "hover:bg-gray-100"
                                    }`}
                                    style={{ 
                                        backgroundColor: isActive ? 'var(--color-accent-utility)' : 'transparent',
                                        color: isActive ? 'white' : 'var(--color-text-dark)'
                                    }}
                                >
                                    {link.name}
                                </button>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => {
                                        navigate(link.path);
                                        setIsOpen(false);
                                    }}
                                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                                        isActive ? "bg-gray-100" : "hover:bg-gray-50"
                                    }`}
                                    style={{ 
                                        color: isActive ? 'var(--color-accent-utility)' : 'var(--color-text-dark)',
                                        borderLeft: isActive ? '4px solid var(--color-accent-utility)' : '4px solid transparent'
                                    }}
                                >
                                    {link.name}
                                </button>
                            );
                        })}
                        <div className="border-t border-gray-200 my-2 pt-2">
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 text-base font-bold text-red-600 hover:bg-red-50 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}