using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;
using SmartBaku.API.Services;

namespace SmartBaku.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NavigationController : ControllerBase
{
    private readonly AppDbContext _db;

    public NavigationController(AppDbContext db) => _db = db;

    [HttpPost("route")]
    public async Task<IActionResult> CalculateRoute([FromBody] RouteRequest request)
    {
        // Calculate distance (Haversine)
        var distance = HaversineDistance(request.FromLat, request.FromLng, request.ToLat, request.ToLng);

        // Get traffic lights along approximate route
        var lights = await _db.TrafficLights.ToListAsync();
        var routeLights = lights
            .Where(l => IsNearRoute(l.Lat, l.Lng, request.FromLat, request.FromLng, request.ToLat, request.ToLng, 0.005))
            .Select(l => new TrafficLightInfo { Lat = l.Lat, Lng = l.Lng, Phase = l.CurrentPhase, CycleDuration = l.CycleDurationSeconds })
            .ToList();

        // Calculate green wave
        var greenWave = GreenWaveCalculator.Calculate(distance, 60, routeLights);

        // Estimated time with and without green wave
        var normalTimeMin = (distance / 40) * 60; // avg 40 km/h in city
        var greenWaveTimeMin = normalTimeMin - greenWave.TimeSavedMinutes;

        return Ok(new
        {
            distanceKm = Math.Round(distance, 1),
            normalTimeMinutes = Math.Round(normalTimeMin, 0),
            greenWaveTimeMinutes = Math.Round(greenWaveTimeMin, 0),
            greenWave = new
            {
                greenWave.OptimalSpeed,
                greenWave.TimeSavedMinutes,
                greenWave.FuelSavedPercent,
                greenWave.GreenLightsCount,
                greenWave.Message
            },
            trafficLightsOnRoute = routeLights.Count
        });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchStreets([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(Array.Empty<object>());
        var streets = await _db.Streets
            .Where(s => s.Name.ToLower().Contains(q.ToLower()))
            .Select(s => new { s.Id, s.Name })
            .Take(10)
            .ToListAsync();
        return Ok(streets);
    }

    private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private static bool IsNearRoute(double pLat, double pLng, double lat1, double lng1, double lat2, double lng2, double threshold)
    {
        var minLat = Math.Min(lat1, lat2) - threshold;
        var maxLat = Math.Max(lat1, lat2) + threshold;
        var minLng = Math.Min(lng1, lng2) - threshold;
        var maxLng = Math.Max(lng1, lng2) + threshold;
        return pLat >= minLat && pLat <= maxLat && pLng >= minLng && pLng <= maxLng;
    }
}

public class RouteRequest
{
    public double FromLat { get; set; }
    public double FromLng { get; set; }
    public double ToLat { get; set; }
    public double ToLng { get; set; }
}
