using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace TLOM.API.Services;

public class UserProfileIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirstValue("UserProfileId");
    }
}
