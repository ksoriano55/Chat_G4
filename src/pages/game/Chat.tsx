import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
type TMensaje = {
  body: string;
  from: string;
};
const usersConnected = [
  { id: 1, name: "Swati - THN" },
  { id: 2, name: "Chintu Voda" },
  { id: 3, name: "Pinder whatzap" },
  { id: 4, name: "Priyanshu pune" },
  { id: 5, name: "Harash-mumbai" },
];

const ChatApp = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola", sender: "me", time: "02:00" },
    { id: 2, text: "Yeah...Awsummmmm 😁😁😁", sender: "other", time: "02:01" },
    { id: 3, text: "Como estas?", sender: "me", time: "02:01" },
  ]);
  const [mensajes, setMensajes] = useState<TMensaje[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("mensajeCliente", (data: string) => {
      console.log("cliente", data);
      const newMessaje = {
        body: data,
        from: "",
      };
      setMensajes((state) => [...state, newMessaje]);
    });

    socket.on("usuario_desconectado", (response) => {
      if (response.codigo_usuario === localStorage.getItem("userContrincante")) {
      }
      console.log("response", response)
    });

    return () => {
      socket.off("mensajeCliente");
      socket.off("disconnect");
    };
  }, []);



  const handleSend = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: "me", time: "now" }]);
      setNewMessage("");
    }
  };


  return (
    <div className="flex h-screen">
      {/* Lista de usuarios conectados - Derecha */}
      <div className="w-1/4 bg-white border-l border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Usuarios conectados</h2>
        <ul className="space-y-2">
          {usersConnected.map((user) => (
            <li
              key={user.id}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>
      {/* Lista de Usuarios - Izquierda */}
      <div className="w-3/4 flex flex-col border-r border-gray-300">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 font-bold">Chat</div>

        {/* Chat */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-md mb-2 px-4 py-2 rounded-xl ${msg.sender === "me"
                  ? "bg-green-200 ml-auto text-right"
                  : "bg-white"
                }`}
            >
              <p>{msg.text}</p>
              <span className="text-xs text-gray-500">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 flex border-t border-gray-300">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-400 rounded-lg px-4 py-2"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
