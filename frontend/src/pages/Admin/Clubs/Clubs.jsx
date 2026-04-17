import styles from './Clubs.module.scss';
import ClubCategoryCard from '../../../components/ClubCategoryCard/ClubCategoryCard';
import ClubCard from '../../../components/ClubCard/ClubCard';
import CreateClubCatModal from '../../../components/CreateClubCatModal/CreateClubCatModal';
import EditClubCatModal from '../../../components/EditClubCatModal/EditClubCatModal';
import CreateClubModal from '../../../components/CreateClubModal/CreateClubModal';
import EditClubModal from '../../../components/EditClubModal/EditClubModal';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import Sidebar from "../../../components/Sidebar/Sidebar";
import { Search, Plus, Menu, Palette } from 'lucide-react';
import { useState } from 'react';
import EmptyState from "../../../components/EmptyState/EmptyState";

const Clubs = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [clubs, setClubs] = useState([
      {
        id: 4,
        name: "Кактус",
        description: null,
        classCategoryId: 2,
        defaultTeacherId: 3,
        maxStudents: null,
        isActive: true,
        createdAt: "2026-04-08T20:09:21.164Z",
        clubCategory: {
          id: 2,
          name: "Психологические занятия",
          description: null,
          isActive: true,
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
            phone: "89999999996",
            email: "sokolova@educrm.ru",
          },
        },
      },
      {
        id: 3,
        name: "Калейдоскоп эмоций",
        description: null,
        classCategoryId: 2,
        defaultTeacherId: 3,
        maxStudents: null,
        isActive: true,
        createdAt: "2026-04-08T20:09:21.164Z",
        clubCategory: {
          id: 2,
          name: "Психологические занятия",
          description: null,
          isActive: true,
        },
        teacher: {
          id: 3,
          userId: 4,
          specialty: "Психология",
          bio: null,
          user: {
            firstName: "Мария",
            lastName: "Соколова",
            phone: "89999999996",
            email: "sokolova@educrm.ru",
          },
        },
      },
      {
        id: 2,
        name: "Музыкальные истории",
        description: null,
        classCategoryId: 1,
        defaultTeacherId: 1,
        maxStudents: null,
        isActive: true,
        createdAt: "2026-04-08T20:09:21.163Z",
        clubCategory: {
          id: 1,
          name: "Музыкальные занятия",
          description: null,
          isActive: true,
        },
        teacher: {
          id: 1,
          userId: 2,
          specialty: "Музыка",
          bio: null,
          user: {
            firstName: "Елена",
            lastName: "Иванова",
            phone: "89999999998",
            email: "ivanova@educrm.ru",
          },
        },
      },
      {
        id: 5,
        name: "Театр Взлёт",
        description: null,
        classCategoryId: 3,
        defaultTeacherId: 4,
        maxStudents: null,
        isActive: true,
        createdAt: "2026-04-08T20:09:21.165Z",
        clubCategory: {
          id: 3,
          name: "Развивающие занятия",
          description: null,
          isActive: true,
        },
        teacher: {
          id: 4,
          userId: 5,
          specialty: "Актерское мастерство",
          bio: null,
          user: {
            firstName: "Анастасия",
            lastName: "Данилова",
            phone: "89999999995",
            email: "danilova@educrm.ru",
          },
        },
      },
      {
        id: 6,
        name: "Фотокружок",
        description: null,
        classCategoryId: 3,
        defaultTeacherId: 2,
        maxStudents: null,
        isActive: true,
        createdAt: "2026-04-08T20:09:21.166Z",
        clubCategory: {
          id: 3,
          name: "Развивающие занятия",
          description: null,
          isActive: true,
        },
        teacher: {
          id: 2,
          userId: 3,
          specialty: "Фотография",
          bio: null,
          user: {
            firstName: "Дмитрий",
            lastName: "Петров",
            phone: "89999999997",
            email: "petrov@educrm.ru",
          },
        },
      },
    ]);
    const [createClubModal, setCreateClubModal] = useState(false);
    const [createCatModal, setCreateCatModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isEditCat, setIsEditCat] = useState(false);
    const [selectedClub, setSelectedClub] = useState(null);
    const [isEditClub, setIsEditClub] = useState(false);

    const categoryItems = categories.map((cat) => (
        <li key={cat.id}>
            <ClubCategoryCard
                clubCategory={cat}
                onEdit={() => {
                    setSelectedCategory(cat);
                    setIsEditCat(true);
                }}
            />
        </li>
    ));

    const clubItems = clubs.map((club) => (
        <li key={club.id}>
            <ClubCard
                club={club}
                onEdit={() => {
                    setSelectedClub(club);
                    setIsEditClub(true);
                }}
            />
        </li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Кружки</h1>
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setCreateCatModal(true)}>Добавить категорию</Button>
                    <Button variant='primary' onClick={() => setCreateClubModal(true)}>Добавить кружок</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input icon={Search} placeholder={'Поиск по названию'} value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className={styles.categories}>
                    <h2 className={styles.subheader}>Категории кружков</h2>
                    {categoryItems.length > 0 ? (
                        <ul className={styles.list}>{categoryItems}</ul>
                    ) : (
                        <EmptyState
                            icon={Palette}
                            title={'Нет категорий'}
                            description={'Добавьте первую категорию для начала работы'}
                            action={<Button icon={Plus} onClick={() => setCreateCatModal(true)}>Добавить категорию</Button>}
                        />
                    )}
                </div>
                <div className={styles.clubs}>
                    <h2 className={styles.subheader}>Кружки</h2>
                    {clubItems.length > 0 ? (
                        <ul className={styles.list}>{clubItems}</ul>
                    ) : (
                        <EmptyState
                            icon={Palette}
                            title={'Нет кружков'}
                            description={'Добавьте первый кружок для начала работы'}
                            action={<Button icon={Plus} onClick={() => setCreateClubModal(true)}>Добавить кружок</Button>}
                        />
                    )}
                </div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
			<CreateClubCatModal isOpen={createCatModal} onClose={() => setCreateCatModal(false)} />
            <CreateClubModal isOpen={createClubModal} onClose={() => setCreateClubModal(false)} categories={[]} teachers={[]} />
            <EditClubCatModal
                category={selectedCategory}
                isOpen={isEditCat}
                onClose={() => {
                    setIsEditCat(false);
                    setSelectedCategory(null);
                }}
            />
            <EditClubModal
                club={selectedClub}
                categories={[]}
                teachers={[]}
                isOpen={isEditClub}
                onClose={() => {
                    setIsEditClub(false);
                    setSelectedClub(null);
                }}
            />
        </>
    );
}

export default Clubs;