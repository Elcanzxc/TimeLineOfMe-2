using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Infrastructure.Services;

/// <summary>
/// Реализация хранилища файлов через AWS S3.
/// Заменяет собой временный FileStorageService для Production (AWS / Docker).
/// </summary>
public class AwsS3StorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AwsS3StorageService> _logger;
    private readonly string _bucketName;

    public AwsS3StorageService(
        IAmazonS3 s3Client, 
        IConfiguration configuration, 
        ILogger<AwsS3StorageService> logger)
    {
        _s3Client = s3Client;
        _configuration = configuration;
        _logger = logger;
        _bucketName = _configuration["AWS:BucketName"] 
            ?? throw new InvalidOperationException("AWS:BucketName не настроен в appsettings.");
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var key = $"uploads/{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        
        _logger.LogInformation("Uploading file {FileName} to S3 bucket {BucketName} with key {Key}", fileName, _bucketName, key);

        var putRequest = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);
        
        var cloudFrontDomain = _configuration["AWS:CloudFrontDomain"];
        if (!string.IsNullOrEmpty(cloudFrontDomain))
        {
            return $"https://{cloudFrontDomain}/{key}";
        }
        
        return $"https://{_bucketName}.s3.amazonaws.com/{key}";
    }

    public async Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;
        
        try
        {
            var uri = new Uri(fileUrl);
            var key = uri.AbsolutePath.TrimStart('/');
            
            _logger.LogInformation("Deleting file with key {Key} from S3 bucket {BucketName}", key, _bucketName);

            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file from S3: {FileUrl}", fileUrl);
        }
    }

    public Task<string> GetPresignedUploadUrlAsync(string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var key = $"uploads/presigned/{Guid.NewGuid()}_{fileName}";
        
        _logger.LogInformation("Generating presigned URL for {FileName}", fileName);

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(15),
            ContentType = contentType
        };

        var url = _s3Client.GetPreSignedURL(request);
        return Task.FromResult(url);
    }
}
