import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav 
            className="w-full flex items-center justify-center p-2 sm:p-4 shadow-lg shrink-0"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
            <div className="flex flex-wrap gap-4 sm:gap-10 justify-center w-full">
                <button
                    className="font-bold text-sm sm:text-lg py-2 px-4 rounded transition"
                    style={{ 
                        color: 'var(--color-text-dark)', 
                        backgroundColor: 'var(--color-bg-primary)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-utility)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                    // FIX: Point to '/main/waiter' so it keeps the Navbar
                    onClick={() => navigate('/main/waiter')} 
                >
                    Waiter
                </button>

                <button
                    className="font-bold text-sm sm:text-lg py-2 px-4 rounded transition"
                    style={{ 
                        color: 'var(--color-text-dark)', 
                        backgroundColor: 'var(--color-bg-primary)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-utility)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                    // FIX: Point to '/main/cashier'
                    onClick={() => navigate('/main/cashier')}
                >
                    Cashier
                </button>

                <button
                    className="font-bold text-sm sm:text-lg py-2 px-4 rounded transition"
                    style={{ 
                        color: 'var(--color-text-dark)', 
                        backgroundColor: 'var(--color-bg-primary)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-utility)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                    // FIX: Point to '/main/kitchen'
                    onClick={() => navigate('/main/kitchen')}
                >
                    Kitchen
                </button>

                <button
                    className="font-bold text-sm sm:text-lg py-2 px-4 rounded transition"
                    style={{ 
                        color: 'var(--color-text-dark)', 
                        backgroundColor: 'var(--color-bg-primary)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-utility)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                    onClick={() => navigate('/main/manager')}
                >
                    Menu Editor
                </button>
                
                 <button
                    className="font-bold text-sm sm:text-lg py-2 px-4 rounded transition"
                    style={{ 
                        color: 'var(--color-text-dark)', 
                        backgroundColor: 'var(--color-bg-primary)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-utility)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
                    onClick={() => navigate('/main/dashboard')}
                >
                    Dashboard
                </button>
            </div>
        </nav>
    );
}