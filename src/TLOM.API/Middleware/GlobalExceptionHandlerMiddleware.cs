using System.Net;
using System.Text.Json;
using TLOM.Domain.Exceptions;

namespace TLOM.API.Middleware;

/// <summary>
/// Global Exception Handler — RFC 7807 ProblemDetails.
/// Перехватывает все исключения и возвращает стандартизированный JSON.
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        int statusCode;
        string title;
        string detail;
        IReadOnlyDictionary<string, string[]>? errors = null;

        switch (exception)
        {
            case DomainValidationException validationEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                title = "Validation Error";
                detail = "Одно или несколько полей содержат ошибки.";
                errors = validationEx.Errors;
                break;

            case NotFoundException notFoundEx:
                statusCode = (int)HttpStatusCode.NotFound;
                title = "Not Found";
                detail = notFoundEx.Message;
                break;

            case ForbiddenException forbiddenEx:
                statusCode = (int)HttpStatusCode.Forbidden;
                title = "Forbidden";
                detail = forbiddenEx.Message;
                break;

            case ConflictException conflictEx:
                statusCode = (int)HttpStatusCode.Conflict;
                title = "Conflict";
                detail = conflictEx.Message;
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                title = "Internal Server Error";
                detail = "Произошла внутренняя ошибка сервера.";
                break;
        }

        if (statusCode == (int)HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Domain exception: {Type} — {Message}", exception.GetType().Name, exception.Message);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new
        {
            type = $"https://httpstatuses.com/{statusCode}",
            title,
            status = statusCode,
            detail,
            errors,
            traceId = context.TraceIdentifier
        };

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });

        await context.Response.WriteAsync(json);
    }
}
