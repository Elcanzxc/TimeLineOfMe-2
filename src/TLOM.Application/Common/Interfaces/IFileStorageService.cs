namespace TLOM.Application.Common.Interfaces;

/// <summary>
/// Хранение файлов — реализуется через AWS S3 в Infrastructure.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Загрузить файл и вернуть публичный URL.
    /// </summary>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Удалить файл по URL.
    /// </summary>
    Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Получить presigned URL для прямой загрузки с клиента.
    /// </summary>
    Task<string> GetPresignedUploadUrlAsync(string fileName, string contentType, CancellationToken cancellationToken = default);
}
