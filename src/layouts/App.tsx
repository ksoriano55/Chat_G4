import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import socket from "../utils/socket";

function App() {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const nickname = localStorage.getItem("nickname") || "UsuarioAnonimo";

        socket.on("connect", () => {
            console.log("Conectado al servidor");
            setIsConnected(true);
            socket.emit("reconnect", { nickname });
        });

        socket.on("disconnect", (reason) => {
            console.log("Desconectado del servidor:", reason);
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.log("Error de conexión:", error.message);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
        };
    }, []);


    return (
        <div className="bg-[url('/fondo.jpg')] bg-cover bg-center h-screen flex flex-col">
            <div className="bg-black bg-opacity-75 h-auto flex items-center">
                 <div className="bg-[url('/chat.png')] bg-cover bg-center h-8 my-4 w-28" />
                {/*<div className="bg-[url('/tac.png')] bg-cover bg-center h-8 my-4 w-28" />
                <div className="bg-[url('/toe.png')] bg-cover bg-center h-8 my-4 w-28" /> */}
            </div>
            {!isConnected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
                        <p className="font-semibold text-lg">
                            El servidor no responde, favor esperar un momento...
                        </p>
                    </div>
                </div>
            )}
            <Outlet />
        </div>
    )
}

export default App
