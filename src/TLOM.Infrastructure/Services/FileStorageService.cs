using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Infrastructure.Services;

/// <summary>
/// Заглушка для файлового хранилища.
/// В production заменяется на полноценную реализацию AWS S3 (AWSSDK.S3).
/// </summary>
public class FileStorageService : IFileStorageService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("File upload requested: {FileName} ({ContentType})", fileName, contentType);

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
        }

        var baseUrl = _configuration["Api:BaseUrl"] ?? "http://localhost:5170";
        return $"{baseUrl}/uploads/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        // TODO: Реализация через AWSSDK.S3
        _logger.LogInformation("File delete requested: {FileUrl}", fileUrl);
        return Task.CompletedTask;
    }

    public Task<string> GetPresignedUploadUrlAsync(string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        // TODO: Реализация через AWSSDK.S3 GetPreSignedURL
        _logger.LogInformation("Presigned URL requested: {FileName}", fileName);
        var key = $"uploads/{Guid.NewGuid()}/{fileName}";
        return Task.FromResult($"https://s3.amazonaws.com/tlom-bucket/{key}?presigned=placeholder");
    }
}
