import { useEffect, useMemo, useState } from "react";
// import { Socket } from "socket.io-client";
// import { DefaultEventsMap } from "@socket.io/component-emitter";
import socket from "../../utils/socket";
// import { IStatistics } from "../../interfaces/IStatistics";
import { IResponse } from "../../interfaces/IResponse";
import { useNavigate } from "react-router-dom";

type TMensaje = {
  body: string;
  from: string;
};

/*type appProps = {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
};*/

const Tablero = (/*{ socket }: appProps*/) => {
  let resultValue = { defeats: 0, matches: 0, score: 0, victories: 0, user: localStorage.getItem("user") }
  // const sonidoGanar = new Audio("../../assets/audio/gameOver.mp3");
  // const sonidoPerder = new Audio("../../assets/audio/gameOver.mp3");
  const [isOn, setIsOn] = useState(false);
  const [tablero, setTablero] = useState(Array(9).fill(""));
  const [isXTurn, setIsXTurn] = useState(true);
  const [mensajes, setMensajes] = useState<TMensaje[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [enviar, setEnviar] = useState(false);
  const [bloqueo, setBloqueo] = useState(true);
  // const [resultado, setResultado] = useState<IStatistics>(resultValue)
  const navigate = useNavigate();
  useEffect(() => {
    socket.on("tableroCliente", (response) => {
      const { data, turno } = response;
      setEnviar(false);

      const tableroInvertido = data.map((celda: string) => {
        if (celda === "x") return "o";
        if (celda === "o") return "x";
        return celda; // Si no es "x" ni "o", se deja igual.
      });
      setTablero(tableroInvertido);
      setBloqueo(true);
      setIsXTurn(!turno);
      setIsOn(true);
    });

    socket.on("mensajeCliente", (data: string) => {
      console.log("cliente", data);
      const newMessaje = {
        body: data,
        from: "",
      };
      setMensajes((state) => [...state, newMessaje]);
    });

    socket.on("SaveResult", (data: IResponse) => {
      // console.log("ganeResult", data);
    });

    socket.on("exit_game", (response) => {
      if (response.success === true) {
        navigate("/home");
      }
    });

    socket.on("replay_game", (response) => {
      if (response.success === true) {
        setTablero(Array(9).fill(""));
      }
    });

    socket.on("usuario_desconectado", (response) => {
      if (response.codigo_usuario === localStorage.getItem("userContrincante")) {
      }
      console.log("response", response)
    });

    return () => {
      socket.off("tableroCliente");
      socket.off("mensajeCliente");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (enviar) {
      const userContrincante = localStorage.getItem("userContrincante");
      setIsOn(false);
      socket.emit("tableroServidor", { tablero, isXTurn, userContrincante });
      setBloqueo(!bloqueo);
    }
  }, [tablero]);
  const enviarMensaje = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (mensaje !== "") {
      const newMessaje = {
        body: mensaje,
        from: "Me",
      };
      setMensajes([...mensajes, newMessaje]);
      const userContrincante = localStorage.getItem("userContrincante");
      const newMessage = newMessaje.body;
      socket.emit("mensaje", { newMessage, userContrincante });
      setMensaje("");
    }
  };
  return (
    <>
      <div className="grid grid-cols-3 gap-4 m-4 items-center h-full">
        <div className="bg-Brown bg-opacity-85 h-full grid grid-rows-[auto,1fr,auto]">
          <div className="bg-Brown-Titulo h-16 text-white font-bold text-xl flex items-center pl-7">
            {localStorage.getItem("userContrincante")}
          </div>
          <div className="overflow-y-auto h-[calc(100vh-15rem)]">
            <ul>
              {mensajes.map((mensaje, index) => (
                <li
                  key={index}
                  className={`p-2 px-4 m-5 rounded text-white text-xl table ${mensaje.from === "Me"
                    ? "bg-Rose-Send ml-auto"
                    : "bg-Rose-Recive mr-auto"
                    }`}
                >
                  {mensaje.body}
                </li>
              ))}
            </ul>
          </div>
          <form>
            <div className="bg-white h-16 flex items-center justify-between px-5">
              <input
                type="text"
                onChange={(e) => setMensaje(e.target.value)}
                className="h-4/6 w-full mx-2 my-2 text-xl p-2"
                value={mensaje}
              />
              <button type="submit" onClick={enviarMensaje}>
                <img
                  src="/enviar.png"
                  alt="Imagen del botón"
                  className="w-6 h-6"
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Tablero;
