import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage"; 
import CashierPage from "./pages/CashierPage";
import WaiterPage from "./pages/WaiterPage";
import KitchenPage from "./pages/KitchenPage";
import ManagerPage from "./pages/ManagerPage"; 
import LoginPage from "./pages/LoginPage";
import ManagerDashboardPage from "./pages/ManagerDashboardPage"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 1. Login & Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 2. STANDALONE PAGES (No Navbar) - For specific staff logins */}
        <Route path="/waiter" element={<WaiterPage />} />
        <Route path="/cashier" element={<CashierPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
          
        {/* 3. MANAGER LAYOUT (With Navbar) */}
        <Route path="/main" element={<MainPage />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Manager-Specific Pages */}
          <Route path="manager" element={<ManagerPage />} /> 
          <Route path="dashboard" element={<ManagerDashboardPage />} /> 
          
          {/* --- NEW: Add the operational pages here too! --- */}
          {/* This allows the Manager to view them WITH the Navbar */}
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