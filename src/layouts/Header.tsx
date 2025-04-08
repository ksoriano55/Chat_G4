import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    localStorage.setItem("logOut", "true");
    socket.disconnect();
    navigate("/"); 
  };

  return (
    <div className="bg-black bg-opacity-75 h-auto flex items-center justify-between px-4 py-2">
      {/* Logo */}
      <div className="bg-[url('/chat.png')] bg-cover bg-center h-8 w-28" />

      {/* Botón de cerrar sesión */}
      <button
        onClick={handleLogout}
        className="text-white bg-red-600 hover:bg-red-700 px-4 py-1 rounded-md text-sm"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
