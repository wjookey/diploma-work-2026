import styles from "./Requests.module.scss";
import Sidebar from "../../../components/Sidebar/Sidebar";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Button from "../../../components/Button/Button";
import { Menu, FileText, Plus } from "lucide-react";
import RequestCard from '../../../components/RequestCard/RequestCard';
import Select from "../../../components/Select/Select";
import { REQUEST_STATUS } from "../../../utils/helper";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../../api/axios";
import Loader from "../../../components/Loader/Loader";
import Pagination from "../../../components/Pagination/Pagination";
import { useAuth } from "../../../context/AuthContext";
import EditProfile from "../../../components/EditProfile/EditProfile";

const Requests = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [children, setChildren] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [editModal, setEditModal] = useState(false);
    const { user } = useAuth();
    const [submittingEdit, setSubmittingEdit] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = `/subscriptionRequests?page=${pagination.page}&limit=${pagination.limit}&`;
                if (selectedChild) url += `childId=${selectedChild}&`;
                if (selectedClub) url += `clubId=${selectedClub}&`;
                if (selectedStatus) url += `status=${selectedStatus}&`;
                const res = await api.get(url);
                setRequests(res.data.data);
                if (res.data.pagination) {
                    setPagination({
                        page: res.data.pagination.page,
                        limit: res.data.pagination.limit,
                        total: res.data.pagination.total,
                        totalPages: res.data.pagination.totalPages,
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
    }, [selectedChild, selectedClub, selectedStatus, processing, pagination.page]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resChild, resClub] = await Promise.all([
                    api.get('/children'),
                    api.get('/clubs'),
                ]);
                setChildren(resChild.data.data);
                setClubs(resClub.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadData();
    }, []);

    const handleApprove = async (requestId) => {
        setProcessing(true);
        try {
            await api.put(`/subscriptionRequests/${requestId}/approve`);
            toast.success('Заявка одобрена');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка одобрения заявки');
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (requestId) => {
        setProcessing(true);
        try {
            await api.put(`/subscriptionRequests/${requestId}/reject`);
            toast.success('Заявка отклонена');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка отклонения заявки');
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
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

    if (loading) return <Loader />;

    const requestItems = requests.map((request) => (
        <li key={request.id}><RequestCard request={request} onApprove={() => handleApprove(request.id)} onReject={() => handleReject(request.id)}/></li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Заявки</h1>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Select
                        value={selectedChild}
                        placeholder={selectedChild ? '' : "Ребёнок"}
                        onChange={(e) => {
                            setSelectedChild(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        options={children.map((child) => (
                            {
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }
                        ))}
                    />
                    <Select
                        value={selectedClub}
                        placeholder={selectedClub ? '' : "Кружок"}
                        onChange={(e) => {
                            setSelectedClub(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        options={clubs.map((club) => (
                            {
                                value: club.id,
                                label: club.name
                            }
                        ))}
                    />
                    <Select
                        value={selectedStatus}
                        placeholder={selectedStatus ? '' : "Статус"}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        options={REQUEST_STATUS.map((s) => (
                            {
                                value: s.value,
                                label: s.label
                            }
                        ))}
                    />
                </div>
                {requestItems.length > 0 ? (
                    <>
                        <div className={styles.requests}>
                            <ul className={styles.list}>{requestItems}</ul>
                        </div>
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title={'Нет заявок'}
                        description={'Дождитесь получения заявки'}
                    />
                )}
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(false)}
                onEdit={() => {
                    setEditModal(true);
                    setIsSidebarOpen(false);
                }}
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

export default Requests;
