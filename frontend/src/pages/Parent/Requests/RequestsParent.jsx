import styles from "./RequestsParent.module.scss";
import Sidebar from "../../../components/Sidebar/Sidebar";
import EmptyState from "../../../components/EmptyState/EmptyState";
import Button from "../../../components/Button/Button";
import { Menu, FileText, Plus } from "lucide-react";
import RequestCard from '../../../components/RequestCard/RequestCard';
import Select from "../../../components/Select/Select";
import { REQUEST_STATUS } from "../../../utils/helper";
import { useState, useEffect } from "react";
import CreateRequestModal from "../../../components/CreateRequestModal/CreateRequestModal";
import CreateComboReqModal from '../../../components/CreateComboReqModal/CreateComboReqModal';
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader/Loader";

const RequestsParent = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [children, setChildren] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [createRequest, setCreateRequest] = useState(false);
    const [createCombo, setCreateCombo] = useState(false);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingItem, setCreatingItem] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                let url = '/subscriptionRequests?';
                if (selectedChild) url += `childId=${selectedChild}&`;
                if (selectedStatus) url += `status=${selectedStatus}&`;
                const res = await api.get(url);
                setRequests(res.data.data);
            } catch (error) {
                toast.error("Ошибка получения данных");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [selectedChild, selectedStatus, processing, createRequest, createCombo]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resChild, resClub, resService] = await Promise.all([
                    api.get('/children'),
                    api.get('/clubs'),
                    api.get('/clubServices'),
                ]);

                setChildren(resChild.data.data);
                setClubs(resClub.data.data);
                setServices(resService.data.data);
            } catch (error) {
                console.error(error);
            }
        }

        loadData();
    }, []);

    const handleCreateRequest = async (requestData) => {
        setCreatingItem(true);
        try {
            const data = {
                childId: requestData.childId,
                clubServiceId: requestData.clubServiceId,
                message: requestData.note || null
            };

            await api.post('/subscriptionRequests', data);
            toast.success('Заявка создана');
            setCreateRequest(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания заявки');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleCreateCombo = async (comboData) => {
        setCreatingItem(true);
        try {
            const data = {
                requests: comboData,
            };

            await api.post('/subscriptionRequests/combo', { ...data });
            toast.success('Заявка создана');
            setCreateCombo(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания заявки');
            console.error(error);
        } finally {
            setCreatingItem(false);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        setProcessing(true);
        try {
            await api.delete(`/subscriptionRequests/${requestId}`);
            toast.success('Заявка отклонена');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка отклонения заявки');
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <Loader />;

    const requestItems = requests.map((request) => (
        <li key={request.id}><RequestCard request={request} onCancel={() => handleDeleteRequest(request.id)} isForParent={true} /></li>
    ));

    return (
        <>
            <div className={styles.header}>
                <div className={styles.left}>
                    <div className={styles.sidebarButton}><Button variant='primary' icon={Menu} onClick={() => setIsSidebarOpen(true)} /></div>
                    <h1 className={styles.pageName}>Заявки</h1>
                </div>
               <div className={styles.buttons}>
                    <Button variant='primary' onClick={() => setCreateRequest(true)}>Оставить заявку</Button>
                    <Button variant='primary' onClick={() => setCreateCombo(true)}>Оставить комбо заявку</Button>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.input}>
                    <Select
                        value={selectedChild}
                        placeholder={selectedChild ? '' : "Ребёнок"}
                        onChange={(e) => setSelectedChild(e.target.value)}
                        options={children.map((child) => (
                            {
                                value: child.id,
                                label: `${child.lastName} ${child.firstName}`
                            }
                        ))}
                    />
                    <Select
                        value={selectedStatus}
                        placeholder={selectedStatus ? '' : "Статус"}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        options={REQUEST_STATUS.map((s) => (
                            {
                                value: s.value,
                                label: s.label
                            }
                        ))}
                    />
                </div>
                {requestItems.length > 0 ? (
                    <div className={styles.requests}>
                        <ul className={styles.list}>{requestItems}</ul>
                    </div>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title={'Нет заявок'}
                        description={'Дождитесь получения заявки'}
                    />
                )}
            </div>

            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
            <CreateRequestModal
                children={children}
                clubs={clubs}
                services={services}
                isOpen={createRequest}
                onClose={() => setCreateRequest(false)}
                onAdd={handleCreateRequest}
                loading={creatingItem}
            />
            <CreateComboReqModal
                children={children}
                clubs={clubs}
                services={services}
                isOpen={createCombo}
                onClose={() => setCreateCombo(false)}
                onAdd={handleCreateCombo}
                loading={creatingItem}
            />
        </>
    );
}

export default RequestsParent;
