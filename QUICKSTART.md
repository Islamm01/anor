# SARV Agro Platform — Руководство по запуску

## Что такое SARV?

SARV — цифровая сельскохозяйственная торговая платформа Таджикистана (регион Сугд).
Соединяет фермеров, покупателей, поставщиков и курьеров в одной экосистеме.
Языки: Русский и Таджикский.

---

## Установка (MacBook / Linux)

### Шаг 1: Node.js
```bash
brew install node    # Mac
node --version       # должно быть v18+
```

### Шаг 2: PostgreSQL
```bash
brew install postgresql@16
brew services start postgresql@16
createdb sarv_agro
```

---

## Запуск платформы

### 1. Распакуйте архив
```bash
unzip sarv-platform.zip
cd sarv-platform
```

### 2. Создайте `.env`
```bash
cp .env.example .env
```

| Параметр | Значение |
|----------|----------|
| `DATABASE_URL` | `postgresql://postgres:@localhost:5432/sarv_agro` |
| `NEXTAUTH_SECRET` | Любая строка 32+ символа |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Из Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Из Google Cloud Console |
| `TELEGRAM_BOT_TOKEN` | Токен от @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Ваш Telegram Chat ID |
| `TELEGRAM_WEBHOOK_SECRET` | Любая случайная строка |

### 3. Установка и БД
```bash
npm install
npx prisma migrate dev --name "sarv-init"
npx prisma db seed
```

### 4. Запуск
```bash
npm run dev
# Открыть: http://localhost:3000
```

---

## Telegram Bot Setup

1. Создайте бота через @BotFather → скопируйте токен
2. Напишите боту /start → получите Chat ID через getUpdates
3. После деплоя зарегистрируйте webhook:
```bash
curl -H "Authorization: Bearer ВАШ_NEXTAUTH_SECRET" \
  https://ваш-домен.com/api/telegram/setup
```

---

## Структура сайта

```
/ ─────────── Главная страница SARV
/catalog ──── Каталог продуктов
/cart ──────── Корзина (без входа!)
/checkout ──── Оформление (без входа!)
/order-success Подтверждение заказа

/admin/dashboard  Дашборд
/admin/orders     Заказы + смена статуса
/admin/products   Товары
/admin/suppliers  Поставщики
/admin/couriers   Курьеры
```

## Статусы заказов

NEW_ORDER → ACCEPTED → PREPARING → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED

## Стать администратором
```bash
psql sarv_agro -c "UPDATE \"User\" SET role='ADMIN' WHERE email='ваш@email.com';"
```

---
*SARV Agro Platform | Таджикистан, Сугд | TJS*
