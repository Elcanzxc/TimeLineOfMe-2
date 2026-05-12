namespace TLOM.Domain.Constants;

/// <summary>
/// Все «магические числа» проекта — максимальные длины, лимиты, ограничения.
/// Используется в Entity конфигурациях (Fluent API) и FluentValidation валидаторах.
/// </summary>
public static class DomainConstants
{
    // === Account ===
    public const int MaxEmailLength = 256;
    public const int MaxPasswordHashLength = 512;
    public const int MaxGoogleIdLength = 128;
    public const int MaxRefreshTokenLength = 512;

    // === UserProfile ===
    public const int MaxFirstNameLength = 100;
    public const int MaxLastNameLength = 100;
    public const int MaxUsernameLength = 50;
    public const int MinUsernameLength = 3;
    public const int MaxBioLength = 500;
    public const int MaxAvatarUrlLength = 2048;

    // === Address (Value Object) ===
    public const int MaxCityLength = 100;
    public const int MaxCountryLength = 100;
    public const int MaxRegionLength = 100;

    // === MediaItem ===
    public const int MaxTitleLength = 500;
    public const int MaxOriginalTitleLength = 500;
    public const int MaxDescriptionLength = 5000;
    public const int MaxCoverImageUrlLength = 2048;
    public const int MaxExternalIdLength = 100;

    // === Movie ===
    public const int MaxDirectorLength = 200;
    public const int MaxCastLength = 2000;
    public const int MaxCountryNameLength = 100;
    public const int MaxLanguageLength = 100;
    public const int MaxTrailerUrlLength = 2048;

    // === Genre ===
    public const int MaxGenreNameLength = 100;

    // === Book ===
    public const int MaxAuthorLength = 200;
    public const int MaxPublisherLength = 200;
    public const int MaxIsbnLength = 20;
    public const int MaxSeriesLength = 300;

    // === Game ===
    public const int MaxDeveloperLength = 200;
    public const int MaxPlatformLength = 500;
    public const int MaxAgeRatingLength = 20;
    public const int MaxEngineLength = 100;

    // === Music ===
    public const int MaxArtistLength = 200;
    public const int MaxAlbumLength = 300;
    public const int MaxLabelLength = 200;

    // === Entry ===
    public const int MaxReviewLength = 10000;
    public const int MinRating = 0;
    public const int MaxRating = 10;

    // === EntryEvent ===
    public const int MaxEventNoteLength = 1000;

    // === Comment ===
    public const int MaxCommentTextLength = 2000;
    public const int MinCommentTextLength = 1;

    // === Notification ===
    public const int MaxNotificationMessageLength = 500;
    public const int MaxEntityTypeLength = 100;

    // === AuditLog ===
    public const int MaxAuditEntityTypeLength = 100;
    public const int MaxIpAddressLength = 45;
    public const int MaxUserAgentLength = 512;

    // === Role ===
    public const int MaxRoleNameLength = 50;
}
