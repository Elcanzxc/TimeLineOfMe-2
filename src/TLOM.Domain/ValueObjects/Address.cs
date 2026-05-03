namespace TLOM.Domain.ValueObjects;

/// <summary>
/// Value Object для адреса пользователя (город, страна, регион).
/// Используется как Owned Entity в EF Core (маппится в те же колонки UserProfile).
/// </summary>
public class Address
{
    public string? City { get; set; }

    public string? Country { get; set; }

    public string? Region { get; set; }
}
