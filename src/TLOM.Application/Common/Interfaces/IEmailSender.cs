namespace TLOM.Application.Common.Interfaces;

public interface IEmailSender
{
    Task SendEmailAsync(string toEmail, string subject, string body);
}
