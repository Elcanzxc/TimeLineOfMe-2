namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Хеширование и верификация паролей.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}
