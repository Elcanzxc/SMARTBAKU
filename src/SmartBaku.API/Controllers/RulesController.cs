using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;

namespace SmartBaku.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RulesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RulesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetRules()
    {
        var rules = await _db.TrafficRules
            .OrderByDescending(r => r.ActiveFrom)
            .ToListAsync();
        return Ok(rules);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveRules()
    {
        var now = DateTime.UtcNow;
        var rules = await _db.TrafficRules
            .Where(r => r.ActiveFrom <= now && (r.ActiveTo == null || r.ActiveTo >= now))
            .OrderByDescending(r => r.ActiveFrom)
            .ToListAsync();
        return Ok(rules);
    }

    [HttpGet("street/{streetName}")]
    public async Task<IActionResult> GetRulesForStreet(string streetName)
    {
        var now = DateTime.UtcNow;
        var rules = await _db.TrafficRules
            .Where(r => r.StreetName.ToLower().Contains(streetName.ToLower()) && r.ActiveFrom <= now && (r.ActiveTo == null || r.ActiveTo >= now))
            .ToListAsync();
        return Ok(rules);
    }
}
