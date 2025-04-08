import { Fragment } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routingdata } from './layouts/routingdata';
import './index.css'
import App from './layouts/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Fragment>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          {Routingdata.map((idx) => (
            <Route path={idx.path} element={idx.element} key={Math.random()} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  </Fragment>
);

