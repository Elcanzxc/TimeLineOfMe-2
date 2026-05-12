Сущности и модели данных (Domain Entities)

=== Базовые классы и интерфейсы (Common) ===

BaseEntity (Абстрактный класс):
  Id (PK: Guid). Все доменные сущности наследуют от него.

AuditableEntity (Абстрактный класс, наследуется от BaseEntity):
  CreatedAt, UpdatedAt. Заполняются автоматически через интерсептор.

ISoftDeletable (Интерфейс для мягкого удаления):
  IsDeleted (bool), DeletedAt (DateTime?). Используется для контента (Entry, Comment).

=== Аутентификация и Авторизация (Identity) ===

Account (Сущность аутентификации):
  Id (PK), Email, PasswordHash (nullable),
  EmailConfirmed, EmailConfirmationToken (nullable),
  PasswordResetToken (nullable), PasswordResetTokenExpiry (nullable),
  GoogleId (для OAuth 2.0 привязки),
  RoleId (FK → Role), IsActive, DateCreated, LastLoginAt.
  Навигационные: UserProfile (1:1), RefreshTokens (1:M), AuditLogs (1:M).

RefreshToken (Токен для обновления сессии, поддерживает множественные сессии):
  Id (PK), AccountId (FK), Token, ExpiryTime, IsRevoked, CreatedAt.

Role: Система ролей (например, User, Admin).

=== Профиль пользователя ===

UserProfile (Связан 1:1 с Account):
  Id (PK), AccountId (FK),
  FirstName, LastName, Username (уникальный ник), Bio, AvatarUrl, DateOfBirth,
  IsProfileCompleted, IsProfilePrivate (Флаг скрытия профиля целиком),
  Address (Value Object: City, Country, Region).

=== Ядро контента (Media Items) ===

MediaItem (Базовый абстрактный класс, TPT-наследование):
  Id (PK), Title, OriginalTitle, ReleaseYear, CoverImageUrl, Description, GlobalRating,
  ExternalId, ExternalSource (Enum: TMDB, GoogleBooks, Steam, Spotify),
  MediaType (Enum: Movie, Book, Game, Music).
  Навигационные: Genres (M:M с Genre), Entries (1:M).

Genre (Жанры для контента):
  Id (PK), Name. Связь M:M с MediaItem.

Типы контента (Наследники MediaItem):
  Movie: Director, Duration (минуты), Cast, Country, Language, Budget, TrailerUrl.
  Book: Author, PageCount, Publisher, ISBN, Language, Series, SeriesOrder.
  Game: Developer, Publisher, Platform, AveragePlayTime, AgeRating, Engine, IsMultiplayer.
  Music: Artist, Album, Duration, Label, TrackNumber, Language, ReleaseType (Enum: Single, Album, EP).

=== Таймлайн (Timeline Entry) ===

Entry (Связывает UserProfile и MediaItem) (Реализует ISoftDeletable):
  Id (PK), UserId, MediaItemId,
  Status (Enum EntryStatus: Planned, InProgress, Completed, Dropped, OnHold),
  Rating (0-10), Review, TimeSpent, IsPrivate, IsFavorite,
  IsDeleted, DeletedAt.

EntryEvent (Хронология изменений статуса):
  Id (PK), EntryId, Status (EntryStatus), DateTime, Note.

=== Социальное взаимодействие ===

Follow (Подписка): FollowerId, FollowingId.
Like (Лайк записи): UserId, EntryId.
Comment (Комментарий) (Реализует ISoftDeletable): UserId, EntryId, Text, IsDeleted, DeletedAt.

=== Уведомления и Аудит ===

Notification:
  Id (PK), RecipientId, ActorId, Type (Enum NotificationType),
  EntityType, EntityId, Message, IsRead, CreatedAt.

AuditLog:
  Id (PK), AccountId, Action (Enum AuditAction: Created, Updated, Deleted),
  EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent, Timestamp.

=== Константы и Перечисления (Enums & Constants) ===
Все лимиты на длину строк, максимальные значения (DomainConstants) и дефолты пагинации (PaginationDefaults) строго зафиксированы в доменном слое.
Enums: EntryStatus, ExternalSource, MediaType, NotificationType, ReleaseType, RoleName, AuditAction.