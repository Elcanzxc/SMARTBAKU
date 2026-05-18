using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;
using SmartBaku.API.Hubs;
using SmartBaku.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) && (connectionString.Contains("Server=") || connectionString.Contains("Database=")))
    {
        options.UseSqlServer(connectionString);
    }
    else
    {
        var dbPath = Path.Combine(AppContext.BaseDirectory, "smartbaku.db");
        options.UseSqlite($"Data Source={dbPath}");
    }
});

// SignalR
builder.Services.AddSignalR();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Simulation engine
builder.Services.AddHostedService<SimulationEngine>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-migrate and seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
    {
        db.Database.EnsureCreated();
    }
    else
    {
        db.Database.Migrate();
    }
    SeedData.Initialize(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();
app.MapHub<TrafficHub>("/hubs/traffic");

app.Run();
