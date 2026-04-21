import styles from './Dashboard.module.scss';
import { Menu, Users, Palette, GraduationCap, BookOpen, FileText, CalendarDays, TrendingUp } from 'lucide-react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import StatsCard from '../../../components/StatsCard/StatsCard';
import Button from '../../../components/Button/Button';
import UpcomingLessons from '../../../components/UpcomingLessons/UpcomingLessons';
import RecentPayments from '../../../components/RecentPayments/RecentPayments';
import RecentRequests from '../../../components/RecentRequests/RecentRequests';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader/Loader';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsResponse, recentResponse] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/recent')
                ]);
                setStats(statsResponse.data.data);
                setRecent(recentResponse.data.data);
            } catch (error) {
                toast.error('Ошибка загрузки данных дашборда');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <Loader />;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Дашборд</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.statsCardsFirst}>
                    <StatsCard title={'Всего детей'} data={stats?.totalChildren} icon={Users} />
                    <StatsCard title={'Активных кружков'} data={stats?.totalClubs} icon={Palette} />
                    <StatsCard title={'Преподавателей'} data={stats?.totalTeachers} icon={GraduationCap} />
                    <StatsCard title={'Активных абонементов'} data={stats?.activeSubscriptions} icon={BookOpen} />
                </div>

                <div className={styles.statsCardsSecond}>
                    <StatsCard title={'Занятий сегодня'} data={stats?.todayLessons} icon={CalendarDays} />
                    <StatsCard title={'Доход за месяц'} data={stats?.monthlyRevenue} icon={TrendingUp} />
                    <StatsCard title={'Новых заявок'} data={stats?.pendingRequests} icon={FileText} />
                </div>
                <div className={styles.recentActivity}>
                    <UpcomingLessons lessons={recent?.upcomingLessons} />
                    <RecentPayments payments={recent?.recentPayments} />
                    <RecentRequests requests={recent?.recentRequests} />
                </div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default Dashboard;