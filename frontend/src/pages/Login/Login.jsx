import styles from './Login.module.scss';
import LoginForm from '../../components/LoginForm/LoginFrom';

const Login = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.info}>
                <h2 className={styles.header}>Пристань авантюристов</h2>
                <h3 className={styles.subheader}>Управление дополнительным образованием</h3>
                <img src="logo.svg" alt="Логотип" className={styles.logo} />
            </div>
            <LoginForm />
        </div>
    );
}

export default Login;