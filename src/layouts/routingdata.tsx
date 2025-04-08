// import Tablero from '../pages/game/Tablero';
import Chat from '../pages/game/Chat';
import Login from '../pages/authentication/Login';
import SingUp from '../pages/authentication/SingUp';


export const Routingdata = [
  //Pages
  { path: `/`, element: <Login/> },
  { path: `/chat`, element: <Chat /*socket={socket}*/ /> },
  { path: `/singup`, element: <SingUp /> },

];