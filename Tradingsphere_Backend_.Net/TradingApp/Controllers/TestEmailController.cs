using Microsoft.AspNetCore.Mvc;
using TradingApp.Services;

namespace TradingApp.Controllers;

[ApiController]
[Route("api/test-email")]
public class TestEmailController : ControllerBase
{
    private readonly EmailService _email;

    public TestEmailController(EmailService email)
    {
        _email = email;
    }

    [HttpGet]
    public IActionResult Send()
    {
        _email.Send(
            "yourgmail@gmail.com", // to
            "BTC",                 // asset
            88500,                 // live price
            "ABOVE"                // condition
        );

        return Ok("Email sent successfully!");
    }
}
