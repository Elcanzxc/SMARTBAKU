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
    public async Task<IActionResult> GetRules([FromQuery] string role = "driver")
    {
        var now = DateTime.UtcNow;
        var rules = await _db.TrafficRules
            .Where(r => r.TargetRole == role && r.ActiveFrom <= now && (r.ActiveTo == null || r.ActiveTo >= now))
            .OrderByDescending(r => r.ActiveFrom)
            .ToListAsync();
            
        if (role == "driver")
        {
            return Ok(new {
                recent = rules.Where(r => r.RuleCategory == "recent").ToList(),
                location = rules.Where(r => r.RuleCategory == "location").ToList()
            });
        }
        else
        {
            return Ok(new {
                pedestrian = rules.ToList()
            });
        }
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
}
