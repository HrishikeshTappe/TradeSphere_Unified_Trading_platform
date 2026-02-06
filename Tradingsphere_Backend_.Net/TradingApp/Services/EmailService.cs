using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace TradingApp.Services
{
    public class EmailService
    {
        private readonly SmtpSettings _smtp;

        public EmailService(IOptions<SmtpSettings> opt)
        {
            _smtp = opt.Value;
        }

        // Professional TradeSphere Mail
        public void Send(string to, string asset, decimal price, string condition)
        {
            var client = new SmtpClient(_smtp.Host, _smtp.Port)
            {
                Credentials = new NetworkCredential(_smtp.Email, _smtp.Password),
                EnableSsl = true
            };

            string subject = $"TradeSphere Alert: {asset} Price Triggered";

            string body = $@"
Hello,

We are from TradeSphere 🚀

Your price alert has been triggered!

------------------------------------
Asset      : {asset}
Target     : {price}
Condition  : {condition}
------------------------------------

Thank you for using TradeSphere.

Happy Trading,
TradeSphere Team
";

            var mail = new MailMessage
            {
                From = new MailAddress(_smtp.Email, "TradeSphere Alerts"),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };

            mail.To.Add(to);

            client.Send(mail);
        }
    }
}
