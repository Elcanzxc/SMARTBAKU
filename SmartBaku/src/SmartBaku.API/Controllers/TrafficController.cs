using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;

namespace SmartBaku.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrafficController : ControllerBase
{
    private readonly AppDbContext _db;

    public TrafficController(AppDbContext db) => _db = db;

    [HttpGet("lights")]
    public async Task<IActionResult> GetTrafficLights()
    {
        var lights = await _db.TrafficLights.ToListAsync();
        return Ok(lights);
    }

    [HttpGet("lights/{id}")]
    public async Task<IActionResult> GetTrafficLight(int id)
    {
        var light = await _db.TrafficLights.FindAsync(id);
        if (light == null) return NotFound();
        return Ok(light);
    }

    [HttpGet("streets")]
    public async Task<IActionResult> GetStreets()
    {
        var streets = await _db.Streets.ToListAsync();
        return Ok(streets);
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles()
    {
        var vehicles = await _db.SimulatedVehicles.Select(v => new
        {
            v.Id, v.Type, v.Lat, v.Lng, v.Speed, v.Heading
        }).ToListAsync();
        return Ok(vehicles);
    }

    [HttpGet("crossings")]
    public async Task<IActionResult> GetPedestrianCrossings()
    {
        var crossings = await _db.PedestrianCrossings.ToListAsync();
        return Ok(crossings);
    }

    [HttpGet("congestion")]
    public async Task<IActionResult> GetCongestion()
    {
        // Simulated congestion data based on time of day
        var hour = DateTime.Now.Hour;
        var streets = await _db.Streets.ToListAsync();
        var congestion = streets.Select(s => new
        {
            s.Name,
            Level = GetSimulatedCongestion(s.TrafficLevel, hour),
            s.DefaultSpeedLimit,
            CurrentSpeed = GetSimulatedSpeed(s.DefaultSpeedLimit, s.TrafficLevel, hour)
        });
        return Ok(congestion);
    }

    private static string GetSimulatedCongestion(string baseLevel, int hour)
    {
        // Rush hours: 8-10, 17-19
        bool isRush = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
        return baseLevel switch
        {
            "high" => isRush ? "critical" : "high",
            "medium" => isRush ? "high" : "medium",
            _ => isRush ? "medium" : "low"
        };
    }

    private static int GetSimulatedSpeed(int limit, string level, int hour)
    {
        bool isRush = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
        double factor = level switch
        {
            "high" => isRush ? 0.3 : 0.6,
            "medium" => isRush ? 0.5 : 0.75,
            _ => isRush ? 0.7 : 0.9
        };
        return (int)(limit * factor);
    }
}
