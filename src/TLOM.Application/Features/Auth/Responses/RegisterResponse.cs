namespace TLOM.Application.Features.Auth.Responses;

public class RegisterResponse
{
    public bool RequiresEmailConfirmation { get; set; }
    public string Message { get; set; } = string.Empty;
}
