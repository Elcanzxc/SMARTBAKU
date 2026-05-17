using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;

namespace SmartBaku.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db) => _db = db;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpGet("{id}/stats")]
    public async Task<IActionResult> GetUserStats(int id)
    {
        var stats = await _db.UserStats.FirstOrDefaultAsync(s => s.UserId == id);
        if (stats == null) return NotFound();
        return Ok(stats);
    }

    [HttpGet("coupons")]
    public async Task<IActionResult> GetCoupons()
    {
        var coupons = await _db.Coupons.Where(c => c.IsActive).ToListAsync();
        return Ok(coupons);
    }

    [HttpPost("{id}/redeem/{couponId}")]
    public async Task<IActionResult> RedeemCoupon(int id, int couponId)
    {
        var user = await _db.Users.FindAsync(id);
        var coupon = await _db.Coupons.FindAsync(couponId);
        if (user == null || coupon == null) return NotFound();
        if (user.EcoPoints < coupon.EcoPointsCost)
            return BadRequest(new { message = "Kifayət qədər Eko-balınız yoxdur" });

        user.EcoPoints -= coupon.EcoPointsCost;
        await _db.SaveChangesAsync();

        // Generate a fake QR code data
        var qrData = $"SMARTBAKU-{coupon.PartnerName.ToUpper().Replace(" ", "")}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        return Ok(new { qrCode = qrData, coupon.PartnerName, coupon.Discount, remainingPoints = user.EcoPoints });
    }

    [HttpPost("select-role")]
    public async Task<IActionResult> SelectRole([FromBody] RoleSelection selection)
    {
        var user = await _db.Users.FirstOrDefaultAsync();
        if (user == null)
        {
            user = new Models.User { Name = selection.Name ?? "İstifadəçi", Role = selection.Role };
            _db.Users.Add(user);
            _db.UserStats.Add(new Models.UserStats { UserId = 1, TimeSavedMinutes = 0, FuelSavedPercent = 0 });
        }
        else
        {
            user.Role = selection.Role;
        }
        await _db.SaveChangesAsync();
        return Ok(user);
    }
}

public class RoleSelection
{
    public string Role { get; set; } = "driver";
    public string? Name { get; set; }
}
