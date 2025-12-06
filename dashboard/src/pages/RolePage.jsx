import { useNavigate } from "react-router-dom";

export default function RolePage() {
    const nav = useNavigate();
    function handleSubmit(prop) {
        if(prop === "cashier")
            nav()
    }
    return(
        <div className="bg-white h-screen w-screen flex justify-center items-center flex-col gap-10">
            <button className="bg-slate-800 "
                onClick={handleSubmit}>
                CASHIER
            </button>
            <button className="bg-slate-800">
                MANAGER
            </button>
             <button className="bg-slate-800">
                KITCHEN
            </button>
        </div>
    )
}