import styles from "./ClubCats.module.scss";
import ClubCategoryCard from "../../../components/ClubCategoryCard/ClubCategoryCard";
import CreateClubCatModal from "../../../components/CreateClubCatModal/CreateClubCatModal";
import EditClubCatModal from "../../../components/EditClubCatModal/EditClubCatModal";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { Search, Plus, Menu, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import EmptyState from "../../../components/EmptyState/EmptyState";
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";
import Pagination from "../../../components/Pagination/Pagination";
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const ClubCats = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [createCatModal, setCreateCatModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isEditCat, setIsEditCat] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    const { user } = useAuth();
    const [editModal, setEditModal] = useState(false);

    const [catPagination, setCatPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const urlCat = search 
                    ? `/clubCategories?search=${encodeURIComponent(search)}&page=${catPagination.page}&limit=${catPagination.limit}` 
                    : `/clubCategories?page=${catPagination.page}&limit=${catPagination.limit}`;
                
                const resCat = await api.get(urlCat);
                
                setCategories(resCat.data.data);
                if (resCat.data.pagination) {
                    setCatPagination({
                        page: resCat.data.pagination.page,
                        limit: resCat.data.pagination.limit,
                        total: resCat.data.pagination.total,
                        totalPages: resCat.data.pagination.totalPages
                    });
                }
            } catch (error) {
                toast.error('Ошибка получения данных');
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [search, createCatModal, isEditCat, catPagination.page]);

    const handleCreateCat = async (catData) => {
        setCreatingItem(true);
        try {
            const data = {
                name: catData.name,
                description: catData.description,
            };

            await api.post('/clubCategories', { ...data });
            toast.success('Категория добавлена');
            setCreateCatModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания категории');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdateCat = async (catData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/clubCategories/${catData.id}`, {
                name: catData.name,
                description: catData.description,
            });

            toast.success('Категория обновлена');
            setIsEditCat(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления категория');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUpdateCatStatus = async (catId, isActive) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/clubCategories/${catId}/status`, { isActive: Boolean(isActive) });
            toast.success('Статус категории изменён')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления статуса категории');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeleteCat = async (catId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/clubCategories/${catId}`);
            toast.success('Категория удалена');
            setIsEditCat(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления категории');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleUserUpdate = async (formData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/users/${user.id}`, formData);
            toast.success('Данные обновлены');
            setEditModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка обновления данных");
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

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

    const handleCatPageChange = (newPage) => {
        setCatPagination(prev => ({ ...prev, page: newPage }));
    };

    if (loading) return <Loader />;

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Категории кружков</h1>
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setCreateCatModal(true)}>Добавить категорию</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Input
                        icon={Search}
                        placeholder={'Поиск по названию'}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCatPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                    />
                </div>
                <div className={styles.categories}>
                    {categoryItems.length > 0 ? (
                        <>
                            <ul className={styles.list}>{categoryItems}</ul>
                            <Pagination 
                                pagination={catPagination} 
                                onPageChange={handleCatPageChange}
                            />
                        </>
                    ) : (
                        <EmptyState
                            icon={Palette}
                            title={'Нет категорий'}
                            description={'Добавьте первую категорию для начала работы'}
                            action={<Button icon={Plus} onClick={() => setCreateCatModal(true)}>Добавить категорию</Button>}
                        />
                    )}
                </div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(false)}
                onEdit={() => {
                    setEditModal(true);
                    setIsSidebarOpen(false);
                }}
            />
            <CreateClubCatModal
                isOpen={createCatModal}
                onClose={() => setCreateCatModal(false)}
                onAdd={handleCreateCat}
                loading={creatingItem}
            />
            <EditClubCatModal
                category={selectedCategory}
                isOpen={isEditCat}
                onClose={() => {
                    setIsEditCat(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleUpdateCat}
                onDelete={handleDeleteCat}
                onStatusChange={handleUpdateCatStatus}
                loading={submittingEdit}
            />
            <EditProfile
                user={user}
                onSubmit={handleUserUpdate}
                isOpen={editModal}
                onClose={() => setEditModal(false)}
                loading={submittingEdit}
            />
        </>
    );
}

export default ClubCats;