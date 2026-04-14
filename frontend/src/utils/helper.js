export const formatDate = (date) => {
    const [year, month, day] = date.split('T')[0].split('-');
    const formatted = `${day}.${month}.${year}`;
    return formatted;
}

export const getSubscriptionType = (type) => {
    const map = {
        TRIAL: 'Пробное',
        SINGLE: 'Разовое',
        SUBSCRIPTION: 'Абонемент',
        CAMP: 'Лагерь',
        AFTERSCHOOL: 'Продлёнка'
    }

    return map[type];
}

export const getSubscriptionStatus = (status) => {
    const map = {
        ACTIVE: 'Активный',
        EXPIRED: 'Истёк',
        CANCELLED: 'Отменён',
        PENDING: 'В ожидании'
    }

    return map[status];
}

export const getLessonStatus = (status) => {
    const map = {
        SCHEDULED: 'Запланировано',
        COMPLETED: 'Проведено',
        CANCELLED: 'Отменено',
    }

    return map[status];
}

export const getSubPaymentStatus = (payment) => {
    if (payment === null) return 'Не оплачено';
    else return 'Оплачено';
}