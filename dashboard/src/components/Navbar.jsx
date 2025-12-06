import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
  return (
    <nav className="w-full h-16 bg-gray-800 flex items-center justify-center px-10">
        <div className="flex gap-10 ml-auto mr-auto">
            <button className="text-white font-bold text-lg"
                    onClick={() => navigate('/main/waiter')}
            >Waiter</button>
            <button className="text-white font-bold text-lg"
                    onClick={() => navigate('/main/cashier')}
            >Cashier</button>
            <button className="text-white font-bold text-lg"
                    onClick={() => navigate('/main/kitchen')}
            >Kitchen</button>
            <button className="text-white font-bold text-lg"
                    onClick={() => navigate('/main/manager')}
            >Manager</button>
        </div>
    </nav>
  );
}