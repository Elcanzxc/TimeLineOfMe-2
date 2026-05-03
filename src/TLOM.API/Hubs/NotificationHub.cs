using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TLOM.API.Hubs;

/// <summary>
/// SignalR Hub для real-time уведомлений.
/// Клиент подключается с JWT токеном через query string.
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        _logger.LogInformation("SignalR: User {UserId} connected", userId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        _logger.LogInformation("SignalR: User {UserId} disconnected", userId);
        await base.OnDisconnectedAsync(exception);
    }
}
