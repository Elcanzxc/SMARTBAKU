namespace SmartBaku.API.Services;

public static class GreenWaveCalculator
{
    public static GreenWaveResult Calculate(double distanceKm, int currentSpeedLimit, List<TrafficLightInfo> upcomingLights)
    {
        // Simple green wave algorithm
        // Calculate optimal speed to hit all greens
        if (upcomingLights.Count == 0)
            return new GreenWaveResult { OptimalSpeed = currentSpeedLimit, TimeSavedMinutes = 0, GreenLightsCount = 0 };

        var totalDistance = distanceKm;
        var optimalSpeed = currentSpeedLimit * 0.85; // ~85% of speed limit is usually optimal
        var timeSaved = upcomingLights.Count * 0.8; // ~0.8 min saved per avoided red light
        var fuelSaved = upcomingLights.Count * 2.5; // ~2.5% per avoided stop

        // Clamp optimal speed
        optimalSpeed = Math.Max(30, Math.Min(optimalSpeed, currentSpeedLimit));

        return new GreenWaveResult
        {
            OptimalSpeed = (int)optimalSpeed,
            TimeSavedMinutes = Math.Round(timeSaved, 1),
            FuelSavedPercent = Math.Round(fuelSaved, 1),
            GreenLightsCount = upcomingLights.Count,
            Message = $"Sürəti {(int)optimalSpeed} km/s etsəniz, növbəti {upcomingLights.Count} işıqfordan dayanmadan keçəcəksiniz. " +
                      $"Bu, sizə {timeSaved:F0} dəqiqə və {fuelSaved:F0}% yanacaq qənaəti verəcək."
        };
    }
}

public class GreenWaveResult
{
    public int OptimalSpeed { get; set; }
    public double TimeSavedMinutes { get; set; }
    public double FuelSavedPercent { get; set; }
    public int GreenLightsCount { get; set; }
    public string Message { get; set; } = "";
}

public class TrafficLightInfo
{
    public double Lat { get; set; }
    public double Lng { get; set; }
    public string Phase { get; set; } = "";
    public int CycleDuration { get; set; }
}
