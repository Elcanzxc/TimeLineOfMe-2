Технологический стек и стандарты разработки (Обновленная версия)
Бэкенд (REST API):

Платформа: .NET 10, ASP.NET Core Web API.

Архитектура: Onion Architecture (строгое разделение на Core/Domain, Application, Infrastructure и Presentation/API).

Паттерны: Использование паттерна CQRS. В слое Application должна применяться структура на основе фичей (Features folder structure: разделение на Commands, Queries, Handlers, Responses, например, с использованием MediatR).

Работа с данными: Entity Framework Core (подход Code-First). База данных — MS SQL Server. Подход без отдельного Repository-паттерна — IApplicationDbContext с DbSet<T> выступает как Repository + Unit of Work (DbContext EF Core уже реализует оба паттерна). Handlers работают напрямую с IApplicationDbContext.

Аутентификация: Google OAuth 2.0 через ASP.NET Core Identity. Поддержка внешнего провайдера (Google) для регистрации и входа. JWT-токены для авторизации API-запросов.

Аудит и Логирование: Полное структурированное логирование (Serilog). Аудит-логирование всех действий пользователей (создание, изменение, удаление карточек) с сохранением в БД. Админ-панель с доступом к аудит-логам и возможностью управления контентом пользователей.

Real-time уведомления: SignalR для push-уведомлений. Уведомления сохраняются в БД (Notification entity) и мгновенно доставляются через SignalR Hub. Типы: социальные (лайк, подписка, комментарий), административные (действия пользователей), системные (приветствие, напоминания).

Авторизация (3 уровня): JWT Authentication Middleware + ролевая авторизация [Authorize(Roles = "Admin")] + Resource-based Authorization Policies (пользователь может изменять только свои записи). ResourceOwnerRequirement + ResourceOwnerHandler для проверки владельца ресурса.

Кэширование: Redis (AWS ElastiCache) для кэширования часто запрашиваемых данных — популярный контент (MediaItems), публичные профили, результаты поиска.

Хранение файлов: AWS S3 для хранения пользовательских аватарок, обложек контента и других медиафайлов. Загрузка через presigned URLs.

API Versioning: Версионирование API через URL-путь (/api/v1/...). Обеспечивает обратную совместимость при развитии платформы.

Пагинация: Cursor-based пагинация для таймлайна и лент (эффективнее offset при большом объёме данных). Offset-пагинация для админ-панели и простых списков.

Фильтрация и Сортировка: Серверная фильтрация и сортировка для всех списочных эндпоинтов. Таймлайн фильтруется по типу контента (Movie, Book, Game, Music), статусу (Completed, InProgress и т.д.), диапазону дат, рейтингу. Аудит-логи — по типу действия, пользователю, дате. Сортировка по дате, рейтингу, названию. Параметры фильтрации передаются через query-string.

Маппинг объектов: AutoMapper для маппинга между слоями (Domain Entity ↔ DTO ↔ Response). Профили маппинга организованы по фичам (Feature-based Mapping Profiles). Никакого ручного маппинга в Handlers — все преобразования через AutoMapper.

Валидация: FluentValidation с интеграцией в MediatR через ValidationBehavior<TRequest, TResponse> (Pipeline Behavior). Валидация срабатывает автоматически до вызова Handler'а. Для каждого Command/Query создаётся отдельный Validator-класс. При ошибках валидации возвращается стандартизированный ответ с деталями.

Глобальная обработка ошибок: Кастомный ExceptionHandlingMiddleware. Единый формат ответа при ошибках (ProblemDetails — RFC 7807). Маппинг кастомных исключений (NotFoundException, ValidationException, ForbiddenException и т.д.) на соответствующие HTTP-коды (404, 400, 403). Все исключения логируются через Serilog.

Rate Limiting: Ограничение частоты запросов к API (ASP.NET Core Rate Limiting middleware) для защиты от злоупотреблений.

Стандарты: Асинхронный код везде (async/await), использование Dependency Injection. Запрет хардкода: все «магические числа» (максимальные длины строк, лимиты, таймауты, размеры страниц) выносятся в статические классы констант (например, DomainConstants.MaxTitleLength, PaginationDefaults.PageSize). Конфигурационные значения — в appsettings.json. Секреты — в AWS Secrets Manager или переменные окружения. Никаких литералов в коде.

Фронтенд (SPA - Single Page Application):

Ядро и Сборка: React + Vite.

Язык: TypeScript (строгая типизация, strict: true, никаких 'any', чёткое определение интерфейсов для пропсов, стейтов и DTO).

Архитектура: Feature-Based Architecture (или Feature-Sliced Design). Разделение на UI-компоненты (dumb) и компоненты с логикой (smart). Бизнес-логика выносится в кастомные хуки и сервисы.

State Management & Data Fetching: TanStack Query (React Query) для серверного стейта (кэширование, инвалидация, пагинация). Zustand или Redux Toolkit для глобального клиентского стейта (тема, данные юзера, UI-состояния).

Стилизация и UI-кит: Tailwind CSS для утилитарной стилизации. Shadcn UI (или Headless UI) для доступных базовых компонентов. Framer Motion для сложных анимаций (особенно важно для таймлайна и лендинга).

Маршрутизация: React Router v6+ (Data API, loaders, actions).

Работа с формами: React Hook Form в связке с Zod для строгой валидации на клиенте (зеркально FluentValidation на бэкенде).

Real-time: @microsoft/signalr клиент для получения push-уведомлений от бэкенда в реальном времени.

Качество кода и Стандарты: ESLint + Prettier для линтинга и форматирования. Обработка ошибок через Error Boundaries. Разделение кода (Code Splitting) и ленивая загрузка (React.lazy). Вынос всех API-ключей и URL-адресов в .env. Никаких хардкод-строк или магических чисел.

Облачная инфраструктура (AWS):

Развертывание: Весь проект разворачивается на AWS. Docker-контейнеры для бэкенда и фронтенда.

Сервисы AWS:
  — AWS ECS (Fargate) или EC2: Хостинг контейнеров бэкенда (ASP.NET Core API) и фронтенда (React SPA через Nginx).
  — AWS RDS (SQL Server): Управляемая реляционная база данных.
  — AWS S3: Хранение статических файлов (аватарки, обложки контента).
  — AWS ElastiCache (Redis): Кэширование данных.
  — AWS CloudFront (CDN): Раздача статики фронтенда и S3-файлов с низкой задержкой.
  — AWS CloudWatch: Мониторинг, логирование и алерты.

Containerization: Dockerfile для бэкенда (.NET 10) и фронтенда (React + Nginx). Docker Compose для локальной разработки (API + SQL Server + Redis).

CI/CD: Подготовка к автоматизированному деплою (GitHub Actions → ECR → ECS).s