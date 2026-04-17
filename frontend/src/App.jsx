import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './pages/Login/Login';
import Clients from './pages/Admin/Clients/Clients';
import Clubs from './pages/Admin/Clubs/Clubs';
import Services from './pages/Admin/Services/Services';
import Teachers from './pages/Admin/Teachers/Teachers';
import Payments from './pages/Admin/Payments/Payments';
import Requests from './pages/Admin/Requests/Requests';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/clients' element={<Clients/>} />
        <Route path='/clubs' element={<Clubs/>} />
        <Route path='/services' element={<Services/>} />
        <Route path='/teachers' element={<Teachers/>} />
        <Route path='/payments' element={<Payments/>} />
        <Route path='/requests' element={<Requests/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;