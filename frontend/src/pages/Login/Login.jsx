import styles from './Login.module.scss';
import LoginForm from '../../components/LoginForm/LoginFrom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { requestCode, verifyCode } = useAuth();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyCode(email, code);
            toast.success('Добро пожаловать!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestCode = async () => {
        setLoading(true);
        try {
            await requestCode(email);
            toast.success('Код отправлен на почту');
        } catch (err) {
            toast.error(err.response?.data?.message || "Ошибка получения кода");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.info}>
                <h2 className={styles.header}>Пристань авантюристов</h2>
                <h3 className={styles.subheader}>Управление дополнительным образованием</h3>
                <img src="logo.svg" alt="Логотип" className={styles.logo} />
            </div>
            <LoginForm
                loading={loading}
                onEmailChange={(e) => setEmail(e.target.value)}
                onPasswordChange={(e) => setCode(e.target.value)}
                onSubmit={handleSubmit}
                onCodeRequest={handleRequestCode}
            />
        </div>
    );
}

export default Login;