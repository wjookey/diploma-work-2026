export const formatDate = (date) => {
    if (!date) return '-';
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

export const SUBSCRIPTION_STATUS = [
    {value: 'ACTIVE', label: 'Активный'},
    {value: 'EXPIRED', label: 'Истёк'},
    {value: 'CANCELLED', label: 'Отменён'},
    {value: 'PENDING', label: 'В ожидании'},
]

export const getSubscriptionStatus = (status) => {
    return SUBSCRIPTION_STATUS.find((ss) => ss.value === status).label || '';
}

export const LESSON_STATUS = [
    { value: 'SCHEDULED', label: 'Запланировано' },
    { value: 'COMPLETED', label: 'Проведено' },
    { value: 'CANCELLED', label: 'Отменено' }
];

export const getLessonStatus = (status) => {
    if (!status) return '';
    return LESSON_STATUS.find((ls) => ls.value === status).label;
}

export const getSubPaymentStatus = (payment) => {
    if (payment === null) return 'Не оплачено';
    else return 'Оплачено';
}

export const DAYS_OF_WEEK = [
    { value: 1, label: 'Понедельник', short: 'Пн' },
    { value: 2, label: 'Вторник', short: 'Вт' },
    { value: 3, label: 'Среда', short: 'Ср' },
    { value: 4, label: 'Четверг', short: 'Чт' },
    { value: 5, label: 'Пятница', short: 'Пт' },
    { value: 6, label: 'Суббота', short: 'Сб' },
    { value: 7, label: 'Воскресенье', short: 'Вс' }
];

export const getDayName = (day) => {
    if (!day) return '';
    return DAYS_OF_WEEK.find((d) => d.value === day).label;
}

export const REQUEST_STATUS = [
    { value: 'PENDING', label: 'В ожидании' },
    { value: 'APPROVED', label: 'Одобрено' },
    { value: 'REJECTED', label: 'Отклонено' },
];

export const getRequestStatus = (status) => {
    return REQUEST_STATUS.find((s) => s.value === status).label;
}

export const formatDateToISO = (date) => {
    const dateISO = new Date(date);
    return dateISO.toISOString();
};