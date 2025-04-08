import { useNavigate } from "react-router-dom";
import { ICredentials } from "../../interfaces/IUsers";
import { useEffect, useState } from "react";
import socket from "../../utils/socket";
import { IResponse } from "../../interfaces/IResponse";
function Login() {
  localStorage.removeItem("user")
  localStorage.removeItem("userContrincante")
  const initialValue: ICredentials = { usuario: "", password: "" }
  const [credential, setCredential] = useState<ICredentials>(initialValue);
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  useEffect(() => {
    setError("");
    socket.on("loginRespuesta", (data: IResponse) => {
      console.log(data);
      if (data.success) {
        navigate("/chat");
      }else{
        setError(data.message);
      }
    });
  }, [])

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    socket.emit("login", credential);
    // localStorage.setItem("user",credential.nickname)
    //navigate("/chat");
  };

  const handleOnChange = (e: any) => {
    const newFormData: any = { ...credential };
    newFormData[e.name] = e.value;
    setCredential(newFormData)
  }

  return (
    <div className="h-screen  flex items-center justify-center">
      <div className="bg-black bg-opacity-80 text-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form>
          <div className="mb-4">
            <input
              type="text"
              name="usuario"
              placeholder="Usuario"
              onChange={(e: any) => handleOnChange(e.target)}
              className="w-full px-4 py-2 bg-gray-200 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={(e: any) => handleOnChange(e.target)}
              className="w-full px-4 py-2 bg-gray-200 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="text-right mb-4">
            <a href="/singup" className="text-purple-400 hover:underline text-sm">¿No tienes cuenta? Crear</a>
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              <p>{error}</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold py-2 rounded-lg hover:from-blue-600 hover:to-pink-600"
            onClick={handleSubmit}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
export default Login
