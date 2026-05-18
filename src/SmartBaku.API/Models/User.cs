namespace SmartBaku.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "İstifadəçi";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "driver"; // driver | pedestrian
    public int EcoPoints { get; set; } = 0;
    public int Level { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class TrafficRule
{
    public int Id { get; set; }
    public string TargetRole { get; set; } = "driver"; // driver | pedestrian
    public string RuleCategory { get; set; } = "recent"; // recent | location | general
    public string StreetName { get; set; } = "";
    public string Description { get; set; } = "";
    public int SpeedLimit { get; set; }
    public int PreviousSpeedLimit { get; set; }
    public bool IsTemporary { get; set; }
    public string Reason { get; set; } = "";
    public bool RadarActive { get; set; }
    public DateTime ActiveFrom { get; set; }
    public DateTime? ActiveTo { get; set; }
}

public class TrafficLight
{
    public int Id { get; set; }
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string IntersectionName { get; set; } = "";
    public int CycleDurationSeconds { get; set; } = 90;
    public int GreenDurationSeconds { get; set; } = 40;
    public int YellowDurationSeconds { get; set; } = 5;
    public string CurrentPhase { get; set; } = "red"; // red | yellow | green
    public string AiDecision { get; set; } = "";
}

public class Street
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string CoordinatesJson { get; set; } = "[]";
    public int DefaultSpeedLimit { get; set; } = 60;
    public string TrafficLevel { get; set; } = "low"; // low | medium | high
}

public class PedestrianCrossing
{
    public int Id { get; set; }
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string Name { get; set; } = "";
    public bool HasSmartSignal { get; set; } = true;
}

public class UserStats
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public double TimeSavedMinutes { get; set; }
    public double FuelSavedPercent { get; set; }
    public int EmergencyYields { get; set; }
    public int Violations { get; set; }
    public int TripsCount { get; set; }
}

public class Coupon
{
    public int Id { get; set; }
    public string PartnerName { get; set; } = "";
    public string PartnerLogo { get; set; } = "";
    public string Description { get; set; } = "";
    public string Discount { get; set; } = "";
    public int EcoPointsCost { get; set; }
    public bool IsActive { get; set; } = true;
}

public class SimulatedVehicle
{
    public int Id { get; set; }
    public string Type { get; set; } = "car"; // car | ambulance | bus
    public double Lat { get; set; }
    public double Lng { get; set; }
    public double Speed { get; set; }
    public double Heading { get; set; }
    public string RouteJson { get; set; } = "[]";
    public int RouteIndex { get; set; } = 0;
}
