import React, { useEffect, useState } from "react";
import socket from "../../utils/socket";
import EmojiPicker from "emoji-picker-react";
import Header from "../../layouts/Header";
import CryptoJS from "crypto-js";

const ChatApp = () => {
  const [messages, setMessages] = useState([{ id: 0, text: "", sender: "", time: "" }]);
  const [usuarios, setUsuarios] = useState<string[]>([]);
  const [toMessages, setToMessages] = useState("");
  const [newMessage, setNewMessage] = useState("");
  // const [mensaje, setMensaje] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);

  const AES_KEY = "asdfjou%48398fsd**/s.,sdj";

  const cifrarMensaje = (mensaje: string): string => {
    return CryptoJS.AES.encrypt(mensaje, AES_KEY).toString();
  }

  const descifrarMensaje = (mensajeCifrado: string): string =>  {
    const bytes = CryptoJS.AES.decrypt(mensajeCifrado, AES_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  

  useEffect(() => {

    socket.emit("getUserConectados");
    socket.on("getUserOnlineResp", (data: any) => {
      setUsuarios(data.data)

    });
    socket.on("mensajeCliente", (data: string) => {
      console.log("Mensaje recibido:", data);
      const mensaje = descifrarMensaje(data);

      setMessages((messages) => [...messages, { id: messages.length + 1, text: mensaje, sender: localStorage.getItem("to") ?? "", time: getHours(new Date) }]);
    });

    socket.on("usuario_desconectado", (response) => {
      // if (response.codigo_usuario === localStorage.getItem("userContrincante")) {
      // }
    });

    return () => {
      socket.off("mensajeCliente");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (usuarios.length > 0) {
      let userTo = usuarios.filter(x => x !== "UsuarioAnonimo" && x !== localStorage.getItem("user"))[0];
      setToMessages(userTo)
      localStorage.setItem("to",userTo)
      let get_bk_chat = {
        user1: localStorage.getItem("user"),
        user2: userTo
      }
      socket.emit("getBK_chat",get_bk_chat);
      socket.on("get_Chats", (data: any) => {
        setMessages(JSON.parse(descifrarMensaje(data.data)));
      });
    }
  }, [usuarios]);

  useEffect(() => {
    if (messages.length > 0) {
      let save_bk_chat = {
        chat: cifrarMensaje(JSON.stringify(messages)),
        user1: localStorage.getItem("user"),
        user2: toMessages
      }
      socket.emit("saveBK_chat", save_bk_chat);
    }
  }, [messages]);

  const onEmojiClick = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const getHours = (date: Date) => {
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  const handleSend = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      const newMessaje = {
        body: newMessage,
        from: "Me",
      };
      setMessages((messages) =>[...messages, { id: messages.length + 1, text: newMessage, sender: localStorage.getItem("user") ?? "", time: getHours(new Date) }]);
      const to = toMessages;
      const Message = cifrarMensaje(newMessaje.body);

      socket.emit("mensaje", { Message, to });
      setNewMessage("");
    }
  };
  return (
    <>
    <Header/>
    <div className="flex h-screen">
      {/* Lista de usuarios conectados */}
      <div className="w-1/4 bg-white border-l border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Usuarios conectados</h2>
        <ul className="space-y-2">
          {usuarios.filter(x => x !== "UsuarioAnonimo" && x !== localStorage.getItem("user")).map((user, index) => (
            <li
              key={index}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              {user}
            </li>
          ))}
        </ul>
      </div>
      {/* Lista de Usuarios - Izquierda */}
      <div className="w-3/4 flex flex-col border-r border-gray-300">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 font-bold">{toMessages}</div>

        {/* Chat */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          {messages.filter(x => x.text !== "").map((msg) => (
            <div
              key={msg.id}
              className={`max-w-md mb-2 px-4 py-2 rounded-xl ${msg.sender === localStorage.getItem("user")
                ? "bg-green-200 ml-auto text-right"
                : "bg-white"
                }`}
            >
              <p>{msg.text}</p>
              <span className="text-xs text-gray-500">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Entrada de mensaje */}
        <div className="p-4 border-t border-gray-300">
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          <div className="p-4 border-t flex items-center space-x-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="mr-2 text-2xl"
            >
              😊
            </button>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Elegir archivo
              <input
                type="file"
                onChange={(e: any) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border px-4 py-2 rounded"
              placeholder="Escribe un mensaje..."
            />
            <button onClick={handleSend} className="bg-green-600 text-white px-4 py-2 rounded">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
    
  );
};

export default ChatApp;
