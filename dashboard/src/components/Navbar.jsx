import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="w-full bg-gray-800 flex items-center justify-center p-2 sm:p-4">
            <div className="flex flex-wrap gap-4 sm:gap-10 justify-center w-full">
                <button
                    className="text-white font-bold text-sm sm:text-lg py-2 px-4 bg-gray-700 rounded hover:bg-gray-600 transition"
                    onClick={() => navigate('/main/waiter')}
                >
                    Waiter
                </button>
                <button
                    className="text-white font-bold text-sm sm:text-lg py-2 px-4 bg-gray-700 rounded hover:bg-gray-600 transition"
                    onClick={() => navigate('/main/cashier')}
                >
                    Cashier
                </button>
                <button
                    className="text-white font-bold text-sm sm:text-lg py-2 px-4 bg-gray-700 rounded hover:bg-gray-600 transition"
                    onClick={() => navigate('/main/kitchen')}
                >
                    Kitchen
                </button>
                <button
                    className="text-white font-bold text-sm sm:text-lg py-2 px-4 bg-gray-700 rounded hover:bg-gray-600 transition"
                    onClick={() => navigate('/main/manager')}
                >
                    Manager
                </button>
            </div>
        </nav>
    );
}
