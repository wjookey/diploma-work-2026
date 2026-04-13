import { NavLink } from 'react-router-dom';
import styles from './SidebarLink.module.scss';

const SidebarLink = ({ icon: Icon, pageName, keyValue, toValue, endValue }) => {
    return (
        <NavLink key={keyValue} to={toValue} end={endValue} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            {({ isActive }) => (
                <>
                    <Icon className={`${styles.icon} ${isActive ? styles.activeIcon : 'styles.notActiveIcon'}`} />
                    {pageName}
                </>
            )}
        </NavLink>
    );
}

export default SidebarLink;