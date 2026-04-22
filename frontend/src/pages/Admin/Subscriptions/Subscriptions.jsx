import styles from './Subscriptions.module.scss';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Button from '../../../components/Button/Button';
import Select from '../../../components/Select/Select';
import SubscriptionCard from '../../../components/SubscriptionCard/SubscriptionCard';
import { Menu, Plus, BookOpen } from 'lucide-react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import CreateComboModal from '../../../components/CreateComboModal/CreateComboModal';
import CreateSubscriptionModal from '../../../components/CreateSubscriptionModal/CreateSubscriptionModal';
import EditSubscriptionModal from '../../../components/EditSubscriptionModal/EditSubscriptionModal';
import SubDetailed from '../../../components/SubDetailed/SubDetailed';
import { useState, useEffect } from 'react';
import { SUBSCRIPTION_STATUS } from '../../../utils/helper';
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";

const Subscriptions = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [families, setFamilies] = useState([]);
    const [children, setChildren] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [createSub, setCreateSub] = useState(false);
    const [createCombo, setCreateCombo] = useState(false);
    const [editSub, setEditSub] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [watchSub, setWatchSub] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = '/subscriptions?';
                if (selectedClub) url += `clubId=${selectedClub}&`;
                if (selectedFamily) url += `familyId=${selectedFamily}&`;
                if (selectedChild) url += `childId=${selectedChild}&`;
                if (selectedStatus) url += `status=${selectedStatus}&`;
                const res = await api.get(url);
                setSubscriptions(res.data.data);
            } catch (error) {
                toast.error('Ошибка получения данных');
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [selectedFamily, selectedChild, selectedClub, selectedStatus, createSub, createCombo, editSub]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resFam, resChild, resClub, resService] = await Promise.all([
                    api.get('/families'),
                    api.get('/children'),
                    api.get('/clubs'),
                    api.get('/clubServices'),
                ]);

                setFamilies(resFam.data.data);
                setChildren(resChild.data.data);
                setClubs(resClub.data.data);
                setServices(resService.data.data);
            } catch (error) {
                console.error(error);
            }
        }

        loadData();
    }, []);

    const handleCreate = async (subData) => {
        setCreatingItem(true);
        try {
            const data = {
                childId: subData.childId,
                clubId: subData.clubId,
                clubServiceId: subData.clubServiceId,
            };

            await api.post('/subscriptions', { ...data });
            toast.success('Абонемент создан');
            setCreateSub(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания абонемента');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleCreateCombo = async (subData) => {
        setCreatingItem(true);
        try {
            const data = {
                comboSubscriptions: subData,
            };

            await api.post('/subscriptions/combo', { ...data });
            toast.success('Комбо абонемент создан');
            setCreateCombo(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания комбо абонемента');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleUpdate = async (subData) => {
        setSubmittingEdit(true);
        try {
            await api.put(`/subscriptions/${subData.id}`, {
                remainingLessons: subData.remainingLessons,
                usedFreezes: subData.usedFreezes,
            });
            toast.success('Абонемент обновлён');
            setEditSub(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка обновления абонемента');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleCancel = async (subId) => {
        setSubmittingEdit(true);
        try {
            await api.post(`/subscriptions/${subId}/cancel`);
            toast.success('Абонемент отменён');
            setEditSub(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка отмены абонемента');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDelete = async (subId) => {
        setSubmittingEdit(true);
        try {
            await api.delete(`/subscriptions/${subId}`);
            toast.success('Абонемент удалён');
            setEditSub(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка удаления абонемента');
            console.error(error);
        } finally {
            setSubmittingEdit(false);
        }
    };

    if (loading) return <Loader />;

    const subItems = subscriptions.map((sub) => (
        <li key={sub.id}>
            <SubscriptionCard
                subscription={sub}
                onEdit={() => {
                    setSelectedSub(sub);
                    setEditSub(true);
                }}
                onWatchDetailed={() => {
                    setSelectedSub(sub);
                    setWatchSub(true);
                }}
            />
        </li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Абонементы</h1>
                </div>
                <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setCreateCombo(true)}>Добавить комбо</Button>
                    <Button variant='primary' onClick={() => setCreateSub(true)}>Добавить абонемент</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.inputs}>
                    <div className={styles.input}><Select
                        value={selectedFamily || ''}
                        placeholder={selectedFamily ? '' : "Семья"}
                        onChange={(e) => setSelectedFamily(e.target.value)}
                        options={families.map((fam) => (
                            {
                                value: fam.id,
                                label: fam.familyName
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedChild || ''}
                        placeholder={selectedChild ? '' : "Ребёнок"}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        options={children.map((child) => (
                            {
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedClub || ''}
                        placeholder={selectedClub ? '' : "Кружок"}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        options={clubs.map((club) => (
                            {
                                value: club.id,
                                label: club.name
                            }
                        ))}
                    /></div>
                    <div className={styles.input}><Select
                        value={selectedStatus || ''}
                        placeholder={selectedStatus ? '' : "Статус"}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        options={SUBSCRIPTION_STATUS.map((s) => (
                            {
                                value: s.value,
                                label: s.label
                            }
                        ))}
                    /></div>
                </div>
                {subItems.length > 0 ? (
                    <div className={styles.subscriptions}>
                        <ul className={styles.list}>{subItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title={'Нет абонементов'}
                        description={'Создайте первый абонемент'}
                        action={<Button icon={Plus} onClick={() => setCreateSub(true)}>Добавить абонемент</Button>}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <SubDetailed
                subscription={selectedSub}
                service={selectedSub?.clubService}
                payment={selectedSub?.payment}
                isOpen={watchSub}
                onClose={() => {
                    setWatchSub(false);
                    setSelectedSub(false);
                    setSelectedService(false);
                    setSelectedPayment(false);
                }}
            />
            <EditSubscriptionModal
                subscription={selectedSub}
                children={children}
                clubs={clubs}
                services={services}
                isOpen={editSub}
                onClose={() => {
                    setSelectedSub(null);
                    setEditSub(false);
                }}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
                onCancel={handleCancel}
                loading={submittingEdit}
            />
            <CreateComboModal
                children={children}
                clubs={clubs}
                services={services}
                isOpen={createCombo}
                onClose={() => {
                    setCreateCombo(false);
                }}
                onAdd={handleCreateCombo}
                loading={creatingItem}
            />
            <CreateSubscriptionModal
                children={children}
                clubs={clubs}
                services={services}
                isOpen={createSub}
                onAdd={handleCreate}
                onClose={() => {
                    setCreateSub(false);
                }}
                loading={creatingItem}
            />
        </>
    );
}

export default Subscriptions;