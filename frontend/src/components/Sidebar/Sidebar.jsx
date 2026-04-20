import styles from "./Sidebar.module.scss";
import SidebarHeader from "../SidebarHeader/SidebarHeader";
import SidebarLink from "../SidebarLink/SidebarLink";
import SidebarFooter from "../SidebarFooter/SidebarFooter";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Palette,
    CalendarDays,
    CreditCard,
    FileText,
    BookOpen,
    Clipboard,
    AlarmClock,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const adminLinks = [
    { to: "/", icon: LayoutDashboard, label: "Дашборд" },
    { to: "/clients", icon: Users, label: "Клиенты" },
    { to: "/teachers", icon: GraduationCap, label: "Преподаватели" },
    { to: "/clubs", icon: Palette, label: "Кружки" },
    { to: "/services", icon: Clipboard, label: "Услуги" },
    { to: "/schedule", icon: CalendarDays, label: "Расписание" },
    { to: "/lessons", icon: AlarmClock, label: "Уроки" },
    { to: "/subscriptions", icon: BookOpen, label: "Абонементы" },
    { to: "/payments", icon: CreditCard, label: "Оплата" },
    { to: "/requests", icon: FileText, label: "Заявки" },
];

const teacherLinks = [
    { to: "/", icon: CalendarDays, label: "Расписание" },
    { to: "/lessons", icon: AlarmClock, label: "Уроки" },
];

const parentLinks = [
    { to: "/", icon: Users, label: "Моя семья" },
    { to: "/services", icon: Clipboard, label: "Услуги" },
    { to: "/lessons", icon: AlarmClock, label: "Уроки" },
    { to: "/subscriptions", icon: BookOpen, label: "Абонементы" },
    { to: "/payments", icon: CreditCard, label: "Оплата" },
    { to: "/requests", icon: FileText, label: "Заявки" },
];

const Sidebar = ({ isOpen, onToggle }) => {
    const { user, logout } = useAuth();

    const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'TEACHER' ? teacherLinks : parentLinks;

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";

        return () => {
        document.body.style.overflow = "";
        };
    }, [isOpen]);

    const sidebarLinks = links.map((link) => (
        <SidebarLink
            key={link.to}
            keyValue={link.to}
            toValue={link.to}
            endValue={link.to === "/"}
            icon={link.icon}
            pageName={link.label}
        />
    ));

    return (
        <div className={styles.wrapper}>
        <div
            className={`${styles.darkBackground} ${isOpen ? styles.open : styles.close}`}
            onClick={onToggle}
        />
        <aside className={`${styles.sidebar} ${!isOpen ? styles.isClosed : ""}`}>
            <SidebarHeader onClose={onToggle} />
            <nav className={styles.links}>{sidebarLinks}</nav>
            <SidebarFooter onClick={logout} name={`${user.lastName} ${user.firstName}`} email={user.email} />
        </aside>
        </div>
    );
};

export default Sidebar;
