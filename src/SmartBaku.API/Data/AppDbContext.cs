using Microsoft.EntityFrameworkCore;
using SmartBaku.API.Models;

namespace SmartBaku.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TrafficRule> TrafficRules => Set<TrafficRule>();
    public DbSet<TrafficLight> TrafficLights => Set<TrafficLight>();
    public DbSet<Street> Streets => Set<Street>();
    public DbSet<PedestrianCrossing> PedestrianCrossings => Set<PedestrianCrossing>();
    public DbSet<UserStats> UserStats => Set<UserStats>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<SimulatedVehicle> SimulatedVehicles => Set<SimulatedVehicle>();
}
