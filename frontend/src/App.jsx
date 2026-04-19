import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './pages/Login/Login';
import Clients from './pages/Admin/Clients/Clients';
import Clubs from './pages/Admin/Clubs/Clubs';
import Services from './pages/Admin/Services/Services';
import Teachers from './pages/Admin/Teachers/Teachers';
import Payments from './pages/Admin/Payments/Payments';
import Requests from './pages/Admin/Requests/Requests';
import Subscriptions from './pages/Admin/Subscriptions/Subscriptions';
import Schedule from './pages/Admin/Schedule/Schedule';
import Lessons from './pages/Admin/Lessons/Lessons';
import LessonsTeacher from './pages/Teacher/Lessons/LessonsTeacher';
import ScheduleTeacher from './pages/Teacher/Schedule/ScheduleTeacher';
import MyFamily from './pages/Parent/MyFamily/MyFamily';
import ServicesParent from './pages/Parent/Services/ServicesParent';
import LessonsParent from './pages/Parent/Lessons/LessonsParent';
import SubscriptionsParent from './pages/Parent/Subscriptions/SubscriptionsParent';
import PaymentsParent from './pages/Parent/Payments/PaymentsParent';
import RequestsParent from './pages/Parent/Requests/RequestsParent';
import Dashboard from './pages/Admin/Dashboard/Dashboard';

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
        <Route path='/subscriptions' element={<Subscriptions/>} />
        <Route path='/schedule' element={<Schedule/>} />
        <Route path='/lessons' element={<Lessons/>} />
        <Route path='/lessonst' element={<LessonsTeacher/>} />
        <Route path='/schedulet' element={<ScheduleTeacher/>} />
        <Route path='/myFamily' element={<MyFamily/>} />
        <Route path='/myFamily' element={<MyFamily/>} />
        <Route path='/servicesp' element={<ServicesParent/>} />
        <Route path='/lessonsp' element={<LessonsParent/>} />
        <Route path='/subscriptionsp' element={<SubscriptionsParent/>} />
        <Route path='/paymentsp' element={<PaymentsParent/>} />
        <Route path='/requestsp' element={<RequestsParent/>} />
        <Route path='/' element={<Dashboard/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;