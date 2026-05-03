using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TLOM.Application.Common.Behaviors;

namespace TLOM.Application;

/// <summary>
/// Регистрация всех сервисов Application Layer в DI-контейнере.
/// Вызывается из Program.cs: builder.Services.AddApplication();
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // MediatR — все Handlers из текущей сборки
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
        });

        // MediatR Pipeline Behaviors (порядок важен: сначала логирование, потом валидация)
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        // FluentValidation — все Validators из текущей сборки
        services.AddValidatorsFromAssembly(assembly);

        // AutoMapper — все Profiles из текущей сборки
        services.AddAutoMapper(cfg =>
        {
            cfg.AddMaps(assembly);
        });

        return services;
    }
}
