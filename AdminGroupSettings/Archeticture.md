# Photographer CMS

## Architecture

**Current Version:** v0.3.1

---

# Project Goal

Photographer CMS — это система управления сайтом фотографа, работающая на GitHub Pages без собственного сервера.

Архитектура проекта строится таким образом, чтобы максимально разделить:

- интерфейс
- бизнес-логику
- хранение данных

Это позволит в дальнейшем заменить способ хранения данных (LocalStorage → Google Apps Script → другое API) без изменения пользовательского интерфейса.

---

# Project Structure

```
AdminGroupSettings/

│
├── css/
│   └── admin.css
│
├── js/
│
│   ├── components/
│   │
│   │   ├── login.js
│   │   ├── layout.js
│   │   ├── sidebar.js
│   │   ├── header.js
│   │   ├── dashboard.js
│   │   ├── collections.js
│   │   └── collectionView.js
│   │
│   ├── services/
│   │
│   │   └── CollectionService.js
│   │
│   ├── auth.js
│   ├── navigation.js
│   ├── router.js
│   └── app.js
│
└── index.html
```

---

# Layers

Проект делится на несколько независимых уровней.

```
UI

↓

Services

↓

Storage
```

---

## UI

UI отвечает только за отображение.

UI никогда не должен знать:

- где лежат данные
- как они сохраняются
- как работает Google Drive
- как работает Google Apps Script

UI вызывает только методы сервисов.

Пример:

```
Collections.render()

↓

CollectionService.getAll()
```

---

## Services

Services содержат бизнес-логику.

Например:

CollectionService

Отвечает за:

- создание коллекции
- удаление
- переименование
- получение списка коллекций

Позже:

PhotoService

будет отвечать за фотографии.

---

## Storage

Временное хранилище.

Сейчас:

```
LocalStorage
```

Позже:

```
Google Apps Script

↓

Google Sheets

↓

Google Drive
```

Для интерфейса ничего не изменится.

---

# Current Components

## App

Запускает приложение.

Последовательность:

```
Авторизация

↓

Загрузка данных

↓

Построение Layout

↓

Dashboard

↓

Navigation
```

---

## Layout

Создает основную разметку CMS.

Отвечает только за каркас страницы.

---

## Sidebar

Отрисовывает боковое меню.

Не содержит бизнес-логики.

---

## Header

Отрисовывает верхнюю панель.

---

## Dashboard

Главная страница CMS.

---

## Collections

Управление списком коллекций.

Только отображение.

Все операции выполняются через CollectionService.

---

## CollectionView

Отображает содержимое выбранной коллекции.

Позже здесь появятся:

- фотографии
- Drag & Drop
- выбор обложки
- сортировка

---

# Services

## CollectionService

Единственный источник данных о коллекциях.

Методы:

```
load()

save()

getAll()

create()

rename()

remove()
```

---

# Navigation

Navigation отвечает исключительно за переход между разделами CMS.

Он не содержит бизнес-логики.

---

# Design Principles

## Single Responsibility

Каждый компонент отвечает только за одну задачу.

---

## Separation of Concerns

Интерфейс не знает, где лежат данные.

---

## Replaceable Storage

Любое хранилище можно заменить без изменения UI.

---

## No Direct Storage Access

Компоненты никогда не используют:

```
localStorage

Google Drive

Google Sheets
```

напрямую.

Только через сервисы.

---

# Roadmap

## v0.3.0

✅ Архитектура

✅ Dashboard

✅ Sidebar

✅ Header

✅ Navigation

✅ CollectionService

✅ LocalStorage

---

## v0.3.1

🚧 CollectionView

🚧 PhotoService

🚧 Upload

---

## v0.3.2

Google Apps Script

Google Drive

Google Sheets

---

## v0.4.0

Полноценная CMS фотографа

---

# Future

Будущая архитектура проекта.

```
GitHub Pages

↓

Google Apps Script API

↓

Services

↓

Google Drive

Google Sheets

↓

UI
```

---

# Development Rules

Перед добавлением нового функционала необходимо соблюдать следующие правила.

1.

Новая возможность сначала проектируется.

Потом реализуется.

2.

Каждый компонент отвечает только за одну задачу.

3.

Компоненты не должны обращаться напрямую к LocalStorage.

4.

Все операции выполняются через сервисы.

5.

Каждый новый релиз должен сохранять совместимость архитектуры.

6.

Перед выпуском новой версии проводится ревизия проекта.
