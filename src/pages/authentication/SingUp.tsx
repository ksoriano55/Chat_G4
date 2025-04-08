import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUsers } from "../../interfaces/IUsers";
import socket from "../../utils/socket";
import { IResponse } from "../../interfaces/IResponse";

function SingUp() {
  const navigate = useNavigate();
  let initialValue: IUsers = { id: 0, name: "", nickname: "", password: "", status: true }
  const [user, setUser] = useState<IUsers>(initialValue);

  useEffect(() => {
    // Escucha la respuesta del servidor
    socket.on("registroRespuesta", (data:IResponse) => {
      console.log(data);
      if(data.success){
        navigate("/");
      }
    });
  }, [])


  const handleSubmit = (e: any) => {
    e.preventDefault();
    socket.emit("insert_usuario", user);
  };

  const handleOnChange = (e: any) => {
    const newFormData: any = { ...user };
    newFormData[e.name] = e.value;
    setUser(newFormData)
  }

  return (
    <div className="h-screen  flex items-center justify-center">
      <div className="bg-black bg-opacity-80 text-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Registro de Usuario</h1>
        <form>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Nombre"
              name="name"
              onChange={(e: any) => handleOnChange(e.target)}
              className="w-full px-4 py-2 bg-gray-200 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Usuario"
              name="nickname"
              onChange={(e: any) => handleOnChange(e.target)}
              className="w-full px-4 py-2 bg-gray-200 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Contraseña"
              name="password"
              onChange={(e: any) => handleOnChange(e.target)}
              className="w-full px-4 py-2 bg-gray-200 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold py-2 rounded-lg hover:from-blue-600 hover:to-pink-600"
            onClick={handleSubmit}
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  )
}
export default SingUp
