using Microsoft.EntityFrameworkCore;
using TradingApp.Data;
using TradingApp.Services;

var builder = WebApplication.CreateBuilder(args);

// ===================== SERVICES =====================

// Controllers
builder.Services.AddControllers();

// DbContext (MySQL)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

// HttpClient
builder.Services.AddHttpClient();

// Crypto price service
builder.Services.AddScoped<CryptoPriceService>();

// Email alert services
builder.Services.Configure<SmtpSettings>(
    builder.Configuration.GetSection("Smtp"));

builder.Services.AddSingleton<EmailService>();
builder.Services.AddHostedService<AlertWorker>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ===================== MIDDLEWARE =====================

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();
