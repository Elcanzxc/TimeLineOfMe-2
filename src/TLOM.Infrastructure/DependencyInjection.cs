using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TLOM.Application.Common.Interfaces;
using TLOM.Infrastructure.Persistence;
using TLOM.Infrastructure.Persistence.Interceptors;
using TLOM.Infrastructure.Services;

namespace TLOM.Infrastructure;

/// <summary>
/// Регистрация всех сервисов Infrastructure Layer в DI-контейнере.
/// Вызывается из Program.cs: builder.Services.AddInfrastructure(configuration);
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // === EF Core Interceptors ===
        services.AddSingleton<AuditableEntityInterceptor>();

        // === DbContext ===
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                });
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // === Redis Cache ===
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            options.InstanceName = "TLOM_";
        });

        // === HttpClient для внешних API ===
        services.AddHttpClient();

        // === Сервисы ===
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ICacheService, RedisCacheService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<IExternalMediaSearchService, ExternalMediaSearchService>();
        services.AddScoped<IEmailSender, EmailService>();

        return services;
    }
}
