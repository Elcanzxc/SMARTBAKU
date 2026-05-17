using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;
using SmartBaku.API.Hubs;
using System.Text.Json;

namespace SmartBaku.API.Services;

public class SimulationEngine : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IHubContext<TrafficHub> _hub;

    public SimulationEngine(IServiceProvider services, IHubContext<TrafficHub> hub)
    {
        _services = services;
        _hub = hub;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await UpdateVehiclePositions(db);
                await UpdateTrafficLights(db);
                await BroadcastState(db);
            }
            catch { /* ignore errors during simulation */ }

            await Task.Delay(2000, stoppingToken);
        }
    }

    private async Task UpdateVehiclePositions(AppDbContext db)
    {
        var vehicles = await db.SimulatedVehicles.ToListAsync();
        foreach (var v in vehicles)
        {
            try
            {
                var route = JsonSerializer.Deserialize<double[][]>(v.RouteJson);
                if (route == null || route.Length == 0) continue;

                v.RouteIndex = (v.RouteIndex + 1) % route.Length;
                v.Lng = route[v.RouteIndex][0];
                v.Lat = route[v.RouteIndex][1];

                // Add slight randomness
                v.Lat += (Random.Shared.NextDouble() - 0.5) * 0.0003;
                v.Lng += (Random.Shared.NextDouble() - 0.5) * 0.0003;
                v.Speed = v.Type == "ambulance" ? 70 + Random.Shared.Next(20) : 30 + Random.Shared.Next(40);
            }
            catch { }
        }
        await db.SaveChangesAsync();
    }

    private async Task UpdateTrafficLights(AppDbContext db)
    {
        var lights = await db.TrafficLights.ToListAsync();
        var now = DateTime.UtcNow;
        foreach (var l in lights)
        {
            var cyclePos = (int)(now.TimeOfDay.TotalSeconds) % l.CycleDurationSeconds;
            if (cyclePos < l.GreenDurationSeconds)
                l.CurrentPhase = "green";
            else if (cyclePos < l.GreenDurationSeconds + l.YellowDurationSeconds)
                l.CurrentPhase = "yellow";
            else
                l.CurrentPhase = "red";
        }
        await db.SaveChangesAsync();
    }

    private async Task BroadcastState(AppDbContext db)
    {
        var vehicles = await db.SimulatedVehicles.Select(v => new
        {
            v.Id, v.Type, v.Lat, v.Lng, v.Speed, v.Heading
        }).ToListAsync();

        var lights = await db.TrafficLights.Select(l => new
        {
            l.Id, l.Lat, l.Lng, l.IntersectionName, l.CurrentPhase, l.AiDecision
        }).ToListAsync();

        await _hub.Clients.All.SendAsync("SimulationUpdate", new { vehicles, trafficLights = lights });
    }
}
