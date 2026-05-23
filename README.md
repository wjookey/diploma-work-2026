# diploma-work-2026

CRM для детского образовательного центра: администратор, преподаватель, родитель.  
Стек: **Node.js + Express + Prisma + PostgreSQL** (backend), **React + Vite** (frontend).

## Требования

- Node.js 18+
- PostgreSQL 14+
- Почтовый ящик [Yandex](https://mail.yandex.ru/) (SMTP — вход и регистрация по коду на email)
- Аккаунт [Telegram](https://telegram.org/) и бот (если используете Mini App)

## Установка зависимостей

### Backend (Node.js)

Перейдите в папку `backend`:

```bash
cd backend
```

Установите зависимости:

```bash
npm install
```

Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

### Frontend (Node.js)

Перейдите в папку `frontend`:

```bash
cd frontend
```

Установите зависимости:

```bash
npm install
```

## Настройка переменных окружения

Перед запуском проекта настройте переменные окружения для backend.

Создайте файл `.env` в папке `backend`:

Добавьте следующие переменные в файл `.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@localhost:5432/educrm?schema=public

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

YANDEX_EMAIL=your-email@yandex.ru
YANDEX_PASSWORD=your-yandex-app-password
EMAIL_FROM_NAME=Пристань авантюристов

BOT_TOKEN=your-telegram-bot-token
```

Где:

- `PORT` — порт API (по умолчанию `5000`)
- `NODE_ENV` — режим работы (`development`, `production`, `test`)
- `CLIENT_URL` — URL фронтенда для CORS (локально: `http://localhost:5173`)
- `DATABASE_URL` — строка подключения к PostgreSQL (формат: `postgresql://user:password@host:port/dbname?schema=public`)
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — секреты для подписи JWT (длинные случайные строки)
- `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` — срок жизни токенов (например, `1h`, `30d`)
- `YANDEX_EMAIL` — ящик отправителя на Yandex (**обязательно** для авторизации)
- `YANDEX_PASSWORD` — [пароль приложения](https://yandex.ru/support/id/authorization/app-passwords.html) Yandex, не пароль от аккаунта
- `EMAIL_FROM_NAME` — имя в поле «От кого» в письмах
- `BOT_TOKEN` — токен Telegram-бота для проверки `initData` Mini App (обязателен при работе через Telegram)

Фронтенду отдельный `.env` не нужен: запросы идут на `/api`, Vite проксирует их на `http://localhost:5000`.

## Настройка SMTP Yandex

Без SMTP не работают запрос кода, вход и регистрация (`POST /api/auth/requestCode`, `POST /api/auth/verifyCode`).

1. Создайте или выберите ящик на [Яндекс Почте](https://mail.yandex.ru/).
2. В [Яндекс ID → Безопасность](https://id.yandex.ru/security) включите двухфакторную аутентификацию.
3. Создайте **пароль приложения** (раздел «Пароли приложений»).
4. Укажите в `backend/.env`:
   - `YANDEX_EMAIL` — полный адрес этого ящика;
   - `YANDEX_PASSWORD` — скопированный пароль приложения;
   - `EMAIL_FROM_NAME` — название центра в письмах.
5. Проверьте отправку из папки `backend` (в `src/services/test-email.js` укажите свой email получателя):

```bash
node src/services/test-email.js
```

В консоли должны появиться `SMTP connection verified` и `Test email sent successfully`. Проверьте «Входящие» и «Спам».

Параметры SMTP в проекте: `smtp.yandex.ru`, порт `465`, SSL.

## Настройка Telegram Mini App

Mini App — полноценный клиент: те же экраны входа и регистрации по email, плюс автоматический вход для уже привязанных аккаунтов.

### Как работает авторизация в Mini App

1. Пользователь открывает приложение в Telegram.
2. Если в БД у него уже есть `telegram_id`, выполняется автоматический вход (`POST /api/auth/tgAuth`).
3. Если `telegram_id` нет — остаётся форма входа или регистрации (код на email, как в браузере). При успешном входе или регистрации `telegram_id` привязывается к аккаунту (в запрос уходит `initData` из Telegram Web App).
4. При следующем открытии Mini App вход снова будет автоматическим.

### 1. Создать бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram.
2. Команда `/newbot` → укажите имя и username бота.
3. Скопируйте **токен** и добавьте в `backend/.env` как `BOT_TOKEN`.

### 2. Настроить Mini App

1. В BotFather: `/mybots` → ваш бот → **Bot Settings** → **Menu Button** → **Configure menu button**.
2. Укажите URL фронтенда:
   - production — публичный HTTPS-адрес сайта;
   - локальная разработка — HTTPS-туннель (например, [ngrok](https://ngrok.com/), Cloudflare Tunnel) на порт `5173`, т.к. Telegram открывает только HTTPS.
3. Убедитесь, что `CLIENT_URL` в `.env` совпадает с origin, с которого открывается приложение (для CORS).

### 3. Проверка

- Пользователь с `telegram_id` в БД — при открытии Mini App сразу попадает в приложение.
- Новый или непривязанный пользователь — страницы `/login` и `/register`, запрос кода, ввод кода; после этого `telegram_id` сохраняется для следующих входов.

## Настройка базы данных

### Создание базы данных

```sql
CREATE DATABASE educrm;
```

Строка в `.env`:

```
DATABASE_URL=postgresql://educrm_user:your_password@localhost:5432/educrm?schema=public
```

### Выполнение миграций

Из папки `backend`:

```bash
npx prisma migrate deploy
```

Для разработки (создание новых миграций):

```bash
npx prisma migrate dev
```

### Тестовые данные (опционально)

```bash
node prisma/seed.js
```

Пример входа по email после seed: `admin@educrm.ru` → «Получить код» → код из письма.

### Просмотр данных (опционально)

```bash
npx prisma studio
```

## Запуск проекта

После установки зависимостей, настройки `.env`, SMTP, БД и миграций запустите backend и frontend **в двух терминалах**.

Запуск backend:

```bash
cd backend
npm run dev
```

API: [http://localhost:5000/api](http://localhost:5000/api)

Запуск frontend:

```bash
cd frontend
npm run dev
```

Приложение: [http://localhost:5173](http://localhost:5173)

Сборка frontend для production:

```bash
cd frontend
npm run build
npm run preview
```

## Тесты backend

```bash
cd backend
npm test
```
