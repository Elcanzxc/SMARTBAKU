using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Data;
using SmartBaku.API.Models;

namespace SmartBaku.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.Password == req.Password);
        if (user == null)
            return Unauthorized(new { message = "Email və ya şifrə yanlışdır" });

        return Ok(user);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "Bu email artıq qeydiyyatdan keçib" });

        var user = new User
        {
            Name = req.Name,
            Email = req.Email,
            Password = req.Password,
            Role = req.Role,
            EcoPoints = req.Role == "pedestrian" ? 50 : 100 // Welcome bonus
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(user);
    }
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterRequest
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "";
}
