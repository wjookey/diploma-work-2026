import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader/Loader';
import ProtectedRoute from './utils/ProtectedRoute';

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
import Register from './pages/Register/Register';

function LessonsPage() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Lessons />;
  if (user?.role === 'TEACHER') return <LessonsTeacher />;
  return <LessonsParent />;
}

function PaymentsPage() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Payments />;
  return <PaymentsParent />;
}

function RequestsPage() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Requests />;
  return <RequestsParent />;
}

function ServicesPage() {
  const { user } = useAuth();
  if (user?.role === "ADMIN") return <Services />;
  return <ServicesParent />;
}

function SubscriptionsPage() {
  const { user } = useAuth();
  if (user?.role === "ADMIN") return <Subscriptions />;
  return <SubscriptionsParent />;
}

function MainPage() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Dashboard />;
  if (user?.role === 'TEACHER') return <ScheduleTeacher />;
  return <MyFamily />;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path='/register' element={user ? <Navigate to="/" replace /> : <Register />} />

        <Route path='/' element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
        <Route path='/clients' element={<ProtectedRoute roles={['ADMIN']}><Clients /></ProtectedRoute>} />
        <Route path='/clubs' element={<ProtectedRoute roles={['ADMIN']}><Clubs /></ProtectedRoute>} />
        <Route path='/teachers' element={<ProtectedRoute roles={['ADMIN']}><Teachers /></ProtectedRoute>} />
        <Route path='/schedule' element={<ProtectedRoute roles={['ADMIN']}><Schedule /></ProtectedRoute>} />
        <Route path='/services' element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
        <Route path='/payments' element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path='/requests' element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        <Route path='/subscriptions' element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
        <Route path='/lessons' element={<ProtectedRoute><LessonsPage /></ProtectedRoute>} />
        <Route path='*' element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;