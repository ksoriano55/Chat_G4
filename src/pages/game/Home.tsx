import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../estilo.css';
import socket from '../../utils/socket';
import { IResEstatistics } from '../../interfaces/IResponse';
import { IStatistics } from '../../interfaces/IStatistics';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

type TUsuario = {
  id: number;
  name: string;
  nickname: string;
  status: number;
  victories: number;
};


function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChallengeAlert, setShowChallengeAlert] = useState(false);
  const [challengingUser, setChallengingUser] = useState<string | null>(null);
  const [nickName, setNickName] = useState<string | null>(null);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [showFinalAlert, setShowFinalAlert] = useState<"accept" | "reject" | null>(null);
  const [usuarios, setUsuarios] = useState<TUsuario[]>([]);
  const [showModalDesafio, setShowModalDesafio] = useState(false)
  const [usuarioDesafia, setUsuarioDesafia] = useState('')
  const [totals, setTotals] = useState<IStatistics>();
  const [usuariosOnline, setUsuarioOnline] = useState<any[]>();
  const [usuariosPlaying, setUsuarioPlaying] = useState<any[]>();
  const navigate = useNavigate();

  const handleChallengeClick = (userName: string, nickName: string) => {
    setChallengingUser(userName);
    setNickName(nickName)
    setShowChallengeAlert(true);
  };

  const handleAcceptChallenge = () => {
    localStorage.setItem("userContrincante", nickName!)
    socket.emit("desafiar", localStorage.getItem("user"), nickName);
    setShowChallengeAlert(false);
    setWaitingForResponse(true);

    // SIlular que esperamos a otro jugador
    // setTimeout(() => {
    //   setWaitingForResponse(false);
    //   setShowFinalAlert('accept'); //alerta de aceptación
    //   setTimeout(() => {
    //     navigate('/tictactue'); // Redirigir
    //   }, 3000);
    // }, 3000);
  };

  const handleRejectChallenge = () => {
    setShowChallengeAlert(false);
    //setShowFinalAlert('reject'); //alerta de rechazo
  };

  useEffect(() => {
    socket.emit("get_usuarios");

    socket.on("getUsuarios", (response) => {
      setUsuarios(response.data);
    });

    socket.on("recibirDesafios", (response) => {
      setUsuarioDesafia(response.data)
      localStorage.setItem("userContrincante", response.data)
      setNickName(response.data)
      setShowModalDesafio(true)
      console.log(response);
    });

    socket.on("confirmacionDeDesafios", (response) => {
      console.log(response)
      setWaitingForResponse(false);
      if (response.data === true) {
        console.log("Aceptado")
        setShowFinalAlert("accept"); //alerta de aceptación
        navigate("/tictactue");
      } else if (response.data === false) {
        console.log("Rechazado")
        setShowFinalAlert("reject"); //alerta de aceptación
      }
    });

    socket.emit("getStatistics", localStorage.getItem("user"));
    socket.on("statisticsResponse", (data: IResEstatistics) => {
      console.log(data);
      if (data.success) {
        setTotals(data.data);
      }

    });

    socket.emit("getUserConectados");
    socket.on("getUserOnlineResp", (data: any) => {
      setUsuarioOnline(data.data);
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((user) => user.nickname !== data.nickname)
      );
    });

    socket.emit("getUserPlaying");
    socket.on("getUserPlayingResp", (data: any) => {
      console.log("Usuario en juego")
      setUsuarioPlaying(data.data);
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((user) => user.nickname !== data.nickname)
      );
    });

    socket.emit("noPlaying", localStorage.getItem("user"), localStorage.getItem("userContrincante"));


    socket.on("usuario_desconectado", (response) => {
      console.log("Se desconecto: ", response.codigo_usuario)
      socket.emit("getUserConectados");
    });

    return () => {
      socket.off("getUsuarios");
      socket.off("statisticsResponse");
      socket.off("recibirDesafios");
      socket.off("confirmacionDeDesafios");
      socket.off("getUserOnlineResp");
      socket.off("getUserPlayingResp");
      socket.off("disconnect");
    };
  }, []);

  const victories = totals?.victories || 0;
  const defeats = totals?.defeats || 0;
  const matches = totals?.matches || 0;
  const ties = matches - victories - defeats;

  // Bar Chart Data
  const barData = {
    labels: ['Victorias', 'Derrotas', 'Empates'],
    datasets: [
      {
        label: 'Resultados',
        data: [victories, defeats, matches],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
      },
    ],
  };

  // Pie Chart Data
  const pieData = {
    labels: ['Victorias', 'Derrotas', 'Empates'],
    datasets: [
      {
        data: [victories, defeats, matches],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
      },
    ],
  };


  const handleRechazarDesafio = () => {
    setShowModalDesafio(false)
    socket.emit("confirmarDesafio", false, localStorage.getItem("user"), nickName);
    console.log('object')
  }

  const handleAceptarDesafio = () => {
    socket.emit("confirmarDesafio", true, localStorage.getItem("user"), nickName);
    socket.emit("getUserPlaying");
  }

  console.log("usuariosPlaying: ",usuariosPlaying)

  return (
    <div className="h-screen bg-bgDefault text-white p-6 flex flex-row items-start gap-6">
      {/* Caja de estadísticas */}
      <div className="flex-grow bg-black bg-opacity-80 text-white p-6 rounded-lg shadow-lg w-2/3">
        <h1 className="text-2xl font-bold text-center mb-4">Estadísticas del Jugador - {localStorage.getItem("user")}</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-semibold">Partidas Jugadas:</p>
            <p>{totals?.score}</p>
          </div>
          <div>
            <p className="font-semibold text-red-600">Perdidas:</p>
            <p>{totals?.defeats}</p>
          </div>
          <div>
            <p className="font-semibold">Empates:</p>
            <p>{totals?.matches}</p>
          </div>
          <div>
            <p className="font-semibold text-green-500">Victorias:</p>
            <p>{totals?.victories}</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="chart-container">
            <h2>Comparación de Resultados</h2>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="chart-container">
            <h2>Distribución de Resultados</h2>
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Caja de amigos */}
      <div className="flex-grow-0 flex-shrink-0 bg-black bg-opacity-80 text-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Amigos</h2>
        <input
          type="text"
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-md focus:outline-none"
          placeholder="Buscar amigos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-col gap-4">
          {usuarios
            .filter((x) => x.nickname !== localStorage.getItem("user"))
            .map((user) => (
              <div key={user.id} className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span
                      className={`mr-4 w-4 h-4 rounded-full border-2 border-white ${usuariosPlaying?.includes(user.nickname) ? "bg-red-500" : usuariosOnline?.includes(user.nickname) ? "bg-green-500" : "bg-gray-500"
                        }`}
                    ></span>

                    <img
                      src="https://via.placeholder.com/40"
                      alt="perfil"
                      className="rounded-full border-2 border-white"
                    />
                    <div className="ml-2">
                      <p className="font-semibold text-white">{user.name} {user.nickname}</p>
                      <p className="text-sm text-green-400">Victorias: {user.victories}</p>
                    </div>
                  </div>
                  {usuariosOnline?.includes(user.nickname) &&
                    <button
                      className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      onClick={!usuariosPlaying?.includes(user.nickname) ? () => handleChallengeClick(user.name, user.nickname) : undefined} // Enviar nombre del amigo
                    >
                      {usuariosPlaying?.includes(user.nickname) ? 'Jugando...' : 'Desafiar'}
                    </button>
                  }
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Alerta del desafío (modal) */}
      {showChallengeAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
            <p className="font-semibold text-lg">
              ¿Estás seguro de que deseas desafiar a {challengingUser}?
            </p>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg"
                onClick={handleAcceptChallenge}
              >
                Aceptar
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                onClick={handleRejectChallenge}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de aceptación o rechazo */}
      {showFinalAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
            <p className="font-semibold text-lg">
              {showFinalAlert === "accept"
                ? "Han aceptado el desafío."
                : "Han rechazado el desafío."}
            </p>
            {/* Solo aparece un botón después de la alerta */}
            <button
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
              onClick={() => setShowFinalAlert(null)} // Cierra la alerta
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Esperando respuesta */}
      {waitingForResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
            <p className="font-semibold text-lg">
              Esperando respuesta de {challengingUser}...
            </p>
          </div>
        </div>
      )}


      {/* Alerta del recibi un desafio (modal) */}
      {showModalDesafio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg w-96">
            <p className="font-semibold text-lg">
              {usuarioDesafia} te esa desafiando. ¿Aceptas mi desafío?
            </p>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg"
                onClick={handleAceptarDesafio}
              >
                Aceptar
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                onClick={handleRechazarDesafio}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;