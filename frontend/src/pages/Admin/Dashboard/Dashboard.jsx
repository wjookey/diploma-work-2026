import styles from './Dashboard.module.scss';
import { Menu, Users, Palette, GraduationCap, BookOpen, FileText, CalendarDays, TrendingUp } from 'lucide-react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { useState } from 'react';
import StatsCard from '../../../components/StatsCard/StatsCard';
import Button from '../../../components/Button/Button';
import UpcomingLessons from '../../../components/UpcomingLessons/UpcomingLessons';
import RecentPayments from '../../../components/RecentPayments/RecentPayments';
import RecentRequests from '../../../components/RecentRequests/RecentRequests';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        "totalChildren": 5,
        "totalClubs": 6,
        "totalTeachers": 4,
        "activeSubscriptions": 6,
        "pendingRequests": 2,
        "todayLessons": 1,
        "monthlyRevenue": 22200,
        "monthlyPaymentsCount": 3
    });
    const [recent, setRecent] = useState({
      recentPayments: [
        {
          id: 1,
          subscriptionId: 1,
          amount: 8400,
          paymentDate: "2026-04-03T00:00:00.000Z",
          paymentMethod: "Наличные",
          note: null,
          createdAt: "2026-04-08T20:09:21.200Z",
          subscription: {
            id: 1,
            childId: 1,
            clubId: 4,
            clubServiceId: 14,
            remainingLessons: 12,
            usedFreezes: 0,
            stateUpdateDate: null,
            startDate: "2026-04-06T00:00:00.000Z",
            endDate: null,
            status: "ACTIVE",
            createdAt: "2026-04-08T20:09:21.195Z",
            updatedAt: "2026-04-08T20:09:21.195Z",
            child: {
              firstName: "Артём",
              lastName: "Давыдов",
              birthDate: "2016-03-15T00:00:00.000Z",
            },
            clubService: {
              id: 14,
              name: "Абонемент на 12 занятий (+2 заморозки)",
              price: 8400,
              subscriptionLessons: 12,
              freezedLesson: 2,
              clubId: 4,
              type: "SUBSCRIPTION",
              isActive: true,
              createdAt: "2026-04-08T20:09:21.183Z",
              club: {
                name: "Кактус",
              },
            },
          },
        },
        {
          id: 2,
          subscriptionId: 3,
          amount: 8400,
          paymentDate: "2026-04-03T00:00:00.000Z",
          paymentMethod: "Карта",
          note: null,
          createdAt: "2026-04-08T20:09:21.200Z",
          subscription: {
            id: 3,
            childId: 2,
            clubId: 1,
            clubServiceId: 2,
            remainingLessons: 12,
            usedFreezes: 0,
            stateUpdateDate: null,
            startDate: "2026-04-05T00:00:00.000Z",
            endDate: null,
            status: "ACTIVE",
            createdAt: "2026-04-08T20:09:21.197Z",
            updatedAt: "2026-04-08T20:09:21.197Z",
            child: {
              firstName: "Алиса",
              lastName: "Давыдова",
              birthDate: "2018-07-22T00:00:00.000Z",
            },
            clubService: {
              id: 2,
              name: "Абонемент на 12 занятий (+2 заморозки)",
              price: 8400,
              subscriptionLessons: 12,
              freezedLesson: 2,
              clubId: 1,
              type: "SUBSCRIPTION",
              isActive: true,
              createdAt: "2026-04-08T20:09:21.171Z",
              club: {
                name: "Музыкальная энциклопедия",
              },
            },
          },
        },
        {
          id: 3,
          subscriptionId: 4,
          amount: 5400,
          paymentDate: "2026-04-03T00:00:00.000Z",
          paymentMethod: "Карта",
          note: null,
          createdAt: "2026-04-08T20:09:21.200Z",
          subscription: {
            id: 4,
            childId: 2,
            clubId: 5,
            clubServiceId: 19,
            remainingLessons: 6,
            usedFreezes: 0,
            stateUpdateDate: null,
            startDate: "2026-04-06T00:00:00.000Z",
            endDate: null,
            status: "ACTIVE",
            createdAt: "2026-04-08T20:09:21.198Z",
            updatedAt: "2026-04-08T20:09:21.198Z",
            child: {
              firstName: "Алиса",
              lastName: "Давыдова",
              birthDate: "2018-07-22T00:00:00.000Z",
            },
            clubService: {
              id: 19,
              name: "Абонемент на 6 занятий",
              price: 5400,
              subscriptionLessons: 6,
              freezedLesson: 0,
              clubId: 5,
              type: "SUBSCRIPTION",
              isActive: true,
              createdAt: "2026-04-08T20:09:21.186Z",
              club: {
                name: "Театр Взлёт",
              },
            },
          },
        },
      ],
      recentRequests: [
        {
          id: 2,
          familyId: 3,
          childId: 5,
          clubServiceId: 21,
          message: null,
          status: "PENDING",
          createdAt: "2026-04-08T20:09:21.202Z",
          updatedAt: "2026-04-08T20:09:21.202Z",
          family: {
            id: 3,
            familyName: "Семья Смирновых",
            createdAt: "2026-04-08T20:09:21.159Z",
            parents: [
              {
                id: 4,
                userId: 9,
                familyId: 3,
                user: {
                  firstName: "Максим",
                  lastName: "Смирнов",
                },
              },
              {
                id: 5,
                userId: 10,
                familyId: 3,
                user: {
                  firstName: "Ксения",
                  lastName: "Смирнова",
                },
              },
            ],
          },
          child: {
            firstName: "Мария",
            lastName: "Смирнова",
          },
          clubService: {
            id: 21,
            name: "Абонемент на 12 занятий (+2 заморозки)",
            price: 6000,
            subscriptionLessons: 12,
            freezedLesson: 2,
            clubId: 6,
            type: "SUBSCRIPTION",
            isActive: true,
            createdAt: "2026-04-08T20:09:21.188Z",
            club: {
              name: "Фотокружок",
            },
          },
        },
        {
          id: 1,
          familyId: 2,
          childId: 3,
          clubServiceId: 3,
          message: null,
          status: "PENDING",
          createdAt: "2026-04-08T20:09:21.201Z",
          updatedAt: "2026-04-08T20:09:21.201Z",
          family: {
            id: 2,
            familyName: "Семья Самсоновых",
            createdAt: "2026-04-08T20:09:21.157Z",
            parents: [
              {
                id: 3,
                userId: 8,
                familyId: 2,
                user: {
                  firstName: "Анастасия",
                  lastName: "Самсонова",
                },
              },
            ],
          },
          child: {
            firstName: "Владислав",
            lastName: "Самсонов",
          },
          clubService: {
            id: 3,
            name: "Абонемент на 6 занятий",
            price: 4500,
            subscriptionLessons: 6,
            freezedLesson: 0,
            clubId: 1,
            type: "SUBSCRIPTION",
            isActive: true,
            createdAt: "2026-04-08T20:09:21.172Z",
            club: {
              name: "Музыкальная энциклопедия",
            },
          },
        },
      ],
      upcomingLessons: [
        {
          id: 6,
          clubId: 2,
          date: "2026-04-21T00:00:00.000Z",
          startTime: "16:00",
          endTime: "17:30",
          room: null,
          topic: null,
          status: "SCHEDULED",
          assignedTeacherId: 1,
          createdAt: "2026-04-08T20:09:21.192Z",
          club: {
            name: "Музыкальные истории",
          },
          teacher: {
            id: 1,
            userId: 2,
            specialty: "Музыка",
            bio: null,
            user: {
              firstName: "Елена",
              lastName: "Иванова",
            },
          },
        },
        {
          id: 9,
          clubId: 3,
          date: "2026-04-21T00:00:00.000Z",
          startTime: "18:00",
          endTime: "19:30",
          room: null,
          topic: null,
          status: "SCHEDULED",
          assignedTeacherId: 3,
          createdAt: "2026-04-08T20:09:21.192Z",
          club: {
            name: "Калейдоскоп эмоций",
          },
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
            user: {
              firstName: "Мария",
              lastName: "Соколова",
            },
          },
        },
        {
          id: 12,
          clubId: 4,
          date: "2026-04-22T00:00:00.000Z",
          startTime: "18:00",
          endTime: "19:30",
          room: null,
          topic: null,
          status: "SCHEDULED",
          assignedTeacherId: 3,
          createdAt: "2026-04-08T20:09:21.193Z",
          club: {
            name: "Кактус",
          },
          teacher: {
            id: 3,
            userId: 4,
            specialty: "Психология",
            bio: null,
            user: {
              firstName: "Мария",
              lastName: "Соколова",
            },
          },
        },
        {
          id: 15,
          clubId: 5,
          date: "2026-04-23T00:00:00.000Z",
          startTime: "16:00",
          endTime: "17:30",
          room: null,
          topic: null,
          status: "SCHEDULED",
          assignedTeacherId: 4,
          createdAt: "2026-04-08T20:09:21.194Z",
          club: {
            name: "Театр Взлёт",
          },
          teacher: {
            id: 4,
            userId: 5,
            specialty: "Актерское мастерство",
            bio: null,
            user: {
              firstName: "Анастасия",
              lastName: "Данилова",
            },
          },
        },
        {
          id: 18,
          clubId: 6,
          date: "2026-04-23T00:00:00.000Z",
          startTime: "18:00",
          endTime: "19:30",
          room: null,
          topic: null,
          status: "SCHEDULED",
          assignedTeacherId: 2,
          createdAt: "2026-04-08T20:09:21.194Z",
          club: {
            name: "Фотокружок",
          },
          teacher: {
            id: 2,
            userId: 3,
            specialty: "Фотография",
            bio: null,
            user: {
              firstName: "Дмитрий",
              lastName: "Петров",
            },
          },
        },
      ],
    });
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
                    <StatsCard title={'Всего детей'} data={stats.totalChildren} icon={Users} />
                    <StatsCard title={'Активных кружков'} data={stats.totalClubs} icon={Palette} />
                    <StatsCard title={'Преподавателей'} data={stats.totalTeachers} icon={GraduationCap} />
                    <StatsCard title={'Активных абонементов'} data={stats.activeSubscriptions} icon={BookOpen} />
                </div>

                <div className={styles.statsCardsSecond}>
                    <StatsCard title={'Занятий сегодня'} data={stats.todayLessons} icon={CalendarDays} />
                    <StatsCard title={'Доход за месяц'} data={stats.monthlyRevenue} icon={TrendingUp} />
                    <StatsCard title={'Новых заявок'} data={stats.pendingRequests} icon={FileText} />
                </div>
                <div className={styles.recentActivity}>
                    <UpcomingLessons lessons={recent.upcomingLessons} />
                    <RecentPayments payments={recent.recentPayments} />
                    <RecentRequests requests={recent.recentRequests} />
                </div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
        </>
    );
}

export default Dashboard;