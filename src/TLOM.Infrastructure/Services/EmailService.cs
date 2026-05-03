using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TLOM.Application.Common.Interfaces;

namespace TLOM.Infrastructure.Services;

public class EmailService : IEmailSender
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpHost = _configuration["Smtp:Host"];
        var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
        var smtpUsername = _configuration["Smtp:Username"];
        var smtpPassword = _configuration["Smtp:Password"];
        var enableSsl = bool.Parse(_configuration["Smtp:EnableSsl"] ?? "true");
        var fromEmail = _configuration["Smtp:FromEmail"] ?? "noreply@tlom.com";
        var fromName = _configuration["Smtp:FromName"] ?? "Time Line Of Me";

        if (string.IsNullOrEmpty(smtpHost) || smtpUsername == "YOUR_GMAIL@gmail.com")
        {
            _logger.LogWarning("SMTP is not fully configured in appsettings.json. Logging email to console.");
            _logger.LogInformation("--- SENDING EMAIL ---");
            _logger.LogInformation("To: {ToEmail}", toEmail);
            _logger.LogInformation("Subject: {Subject}", subject);
            _logger.LogInformation("Body: {Body}", body);
            _logger.LogInformation("---------------------");
            return;
        }

        try 
        {
            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = enableSsl
            };

            var fromAddress = new MailAddress(fromEmail, fromName);
            var toAddress = new MailAddress(toEmail);
            var mailMessage = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {ToEmail} via {Host}.", toEmail, smtpHost);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}.", toEmail);
            throw;
        }
    }
}
