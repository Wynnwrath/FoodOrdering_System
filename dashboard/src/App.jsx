import { useState } from "react"; 
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage"; 
import CashierPage from "./pages/CashierPage";
import WaiterPage from "./pages/WaiterPage";
import KitchenPage from "./pages/KitchenPage";
import ManagerPage from "./pages/ManagerPage"; 
import LoginPage from "./pages/LoginPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage"; 

function StaffLayout() {
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleLogout = () => {
    if (isConfirming) {
      navigate("/login");
    } else {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 3000);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Outlet />
      
      <button
        onClick={handleLogout}
        className={`fixed bottom-4 right-4 z-50 px-5 py-2 text-sm font-bold rounded-full shadow-xl transition-all ${
            isConfirming 
            ? "bg-red-800 text-white scale-110 animate-pulse" 
            : "bg-red-600 text-white hover:bg-red-700 opacity-90"
        }`}
      >
        {isConfirming ? "Tap to Confirm" : "Logout ↪"}
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<StaffLayout />}>
            <Route path="/waiter" element={<WaiterPage />} />
            <Route path="/cashier" element={<CashierPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
        </Route>
          
        <Route path="/main" element={<MainPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="manager" element={<ManagerPage />} /> 
          <Route path="dashboard" element={<ManagerDashboardPage />} /> 
          <Route path="waiter" element={<WaiterPage />} />
          <Route path="cashier" element={<CashierPage />} />
          <Route path="kitchen" element={<KitchenPage />} />
        </Route>
        
        <Route path="*" element={<p className="p-4 text-center">404 - Page Not Found</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;