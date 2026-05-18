using SmartBaku.API.Models;

namespace SmartBaku.API.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Streets.Any()) return;

        // Real Baku streets
        db.Streets.AddRange(
            new Street { Name = "Neftçilər prospekti", DefaultSpeedLimit = 60, TrafficLevel = "high",
                CoordinatesJson = "[[49.8671,40.3725],[49.8550,40.3780],[49.8430,40.3830]]" },
            new Street { Name = "Heydər Əliyev prospekti", DefaultSpeedLimit = 80, TrafficLevel = "medium",
                CoordinatesJson = "[[49.9200,40.4100],[49.9050,40.4050],[49.8900,40.3950]]" },
            new Street { Name = "Ziya Bünyadov prospekti", DefaultSpeedLimit = 80, TrafficLevel = "high",
                CoordinatesJson = "[[49.9350,40.4200],[49.9250,40.4100],[49.9100,40.3950]]" },
            new Street { Name = "Həsən Əliyev küçəsi", DefaultSpeedLimit = 50, TrafficLevel = "low",
                CoordinatesJson = "[[49.8400,40.3800],[49.8350,40.3750]]" },
            new Street { Name = "Bakıxanov küçəsi", DefaultSpeedLimit = 50, TrafficLevel = "medium",
                CoordinatesJson = "[[49.8500,40.3900],[49.8450,40.3850]]" },
            new Street { Name = "28 May küçəsi", DefaultSpeedLimit = 40, TrafficLevel = "high",
                CoordinatesJson = "[[49.8380,40.3790],[49.8350,40.3770]]" },
            new Street { Name = "Nizami küçəsi", DefaultSpeedLimit = 40, TrafficLevel = "medium",
                CoordinatesJson = "[[49.8350,40.3780],[49.8300,40.3760]]" },
            new Street { Name = "Tbilisi prospekti", DefaultSpeedLimit = 70, TrafficLevel = "medium",
                CoordinatesJson = "[[49.8700,40.4100],[49.8600,40.4050]]" },
            new Street { Name = "Babək prospekti", DefaultSpeedLimit = 80, TrafficLevel = "high",
                CoordinatesJson = "[[49.8100,40.3700],[49.8200,40.3750]]" },
            new Street { Name = "Mərdanov qardaşları küçəsi", DefaultSpeedLimit = 40, TrafficLevel = "low",
                CoordinatesJson = "[[49.8420,40.3770],[49.8400,40.3750]]" }
        );

        // Traffic lights at real Baku intersections
        db.TrafficLights.AddRange(
            new TrafficLight { Lat = 40.3792, Lng = 49.8490, IntersectionName = "28 May metro stansiyası",
                CycleDurationSeconds = 90, GreenDurationSeconds = 40, AiDecision = "Süni intellekt hazırda 28 May istiqamətində yaşıl işığın müddətini 12 saniyə uzadıb." },
            new TrafficLight { Lat = 40.4093, Lng = 49.8671, IntersectionName = "Gənclik metrosu yaxınlığı",
                CycleDurationSeconds = 120, GreenDurationSeconds = 50, AiDecision = "Süni intellekt Neftçilər prospekti istiqamətində yaşıl işığın müddətini sıxlığa görə 15 saniyə uzadıb." },
            new TrafficLight { Lat = 40.3953, Lng = 49.8822, IntersectionName = "Koroğlu metro stansiyası",
                CycleDurationSeconds = 100, GreenDurationSeconds = 45, AiDecision = "Hazırda Tbilisi prospekti istiqamətinə üstünlük verilir. Yaşıl işıq 8 saniyə artırıldı." },
            new TrafficLight { Lat = 40.4180, Lng = 49.9320, IntersectionName = "Ziya Bünyadov - Heydər Əliyev kəsişməsi",
                CycleDurationSeconds = 110, GreenDurationSeconds = 48, AiDecision = "Axşam saatı sıxlığına görə Ziya Bünyadov istiqamətində yaşıl fazanın müddəti 20 saniyə uzadılıb." },
            new TrafficLight { Lat = 40.3700, Lng = 49.8350, IntersectionName = "Sahil bağı yaxınlığı",
                CycleDurationSeconds = 80, GreenDurationSeconds = 35, AiDecision = "Piyada sıxlığı aşkarlandı. Piyada keçidi üçün əlavə 10 saniyə ayrılıb." },
            new TrafficLight { Lat = 40.3820, Lng = 49.8420, IntersectionName = "Nizami küçəsi - Füzuli küçəsi",
                CycleDurationSeconds = 85, GreenDurationSeconds = 38, AiDecision = "Nizami küçəsi istiqamətində avtobuslar üçün prioritet verildi. Yaşıl faza 5 saniyə uzadılıb." },
            new TrafficLight { Lat = 40.4050, Lng = 49.9050, IntersectionName = "Nəriman Nərimanov metro",
                CycleDurationSeconds = 95, GreenDurationSeconds = 42, AiDecision = "Cənub istiqamətindən gələn nəqliyyat üçün yaşıl dalğa optimizasiya edildi." },
            new TrafficLight { Lat = 40.3750, Lng = 49.8100, IntersectionName = "Babək prospekti girişi",
                CycleDurationSeconds = 100, GreenDurationSeconds = 45, AiDecision = "Babək prospektində sürət radarı ilə əlaqəli olaraq sürət həddi xəbərdarlığı göndərildi." }
        );

        // Pedestrian crossings
        db.PedestrianCrossings.AddRange(
            new PedestrianCrossing { Lat = 40.3790, Lng = 49.8485, Name = "28 May - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.4090, Lng = 49.8665, Name = "Gənclik - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.3700, Lng = 49.8345, Name = "Sahil - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.3818, Lng = 49.8415, Name = "Nizami küçəsi - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.3950, Lng = 49.8818, Name = "Koroğlu - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.4048, Lng = 49.9045, Name = "Nəriman Nərimanov - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.4175, Lng = 49.9315, Name = "Ziya Bünyadov - Piyada keçidi" },
            new PedestrianCrossing { Lat = 40.3830, Lng = 49.8550, Name = "Fountains Square - Piyada keçidi" }
        );

        // Traffic rules
        db.TrafficRules.AddRange(
            // Car: Recent changes
            new TrafficRule { TargetRole = "driver", RuleCategory = "recent", StreetName = "Ziya Bünyadov prospekti", Description = "Təmir işlərinə görə sürət həddi endirildi (Son 3 gün)",
                SpeedLimit = 60, PreviousSpeedLimit = 80, IsTemporary = true, Reason = "Yol təmiri", RadarActive = true,
                ActiveFrom = DateTime.UtcNow.AddDays(-3), ActiveTo = DateTime.UtcNow.AddDays(14) },
            new TrafficRule { TargetRole = "driver", RuleCategory = "recent", StreetName = "Heydər Əliyev prospekti", Description = "Yeni avtobus zolağı istifadəyə verildi",
                SpeedLimit = 80, PreviousSpeedLimit = 80, IsTemporary = false, Reason = "Yeni zolaq", RadarActive = false,
                ActiveFrom = DateTime.UtcNow.AddDays(-2) },
            
            // Car: Location-specific
            new TrafficRule { TargetRole = "driver", RuleCategory = "location", StreetName = "Neftçilər prospekti", Description = "Bu ərazidə parkinq qadağandır. Radar nəzarəti var.",
                SpeedLimit = 60, PreviousSpeedLimit = 60, IsTemporary = false, Reason = "Parkinq qadağası", RadarActive = true,
                ActiveFrom = DateTime.UtcNow.AddYears(-1) },
            new TrafficRule { TargetRole = "driver", RuleCategory = "location", StreetName = "Tbilisi prospekti", Description = "Növbəti kəsişmədə sağa dönmək qadağandır",
                SpeedLimit = 70, PreviousSpeedLimit = 70, IsTemporary = false, Reason = "Hərəkət sxemi", RadarActive = false,
                ActiveFrom = DateTime.UtcNow.AddYears(-1) },
            
            // Pedestrian rules
            new TrafficRule { TargetRole = "pedestrian", RuleCategory = "general", StreetName = "Nizami küçəsi", Description = "Yalnız piyadalar üçün nəzərdə tutulmuş zona",
                SpeedLimit = 0, PreviousSpeedLimit = 0, IsTemporary = false, Reason = "Piyada zonası", RadarActive = false,
                ActiveFrom = DateTime.UtcNow.AddYears(-5) },
            new TrafficRule { TargetRole = "pedestrian", RuleCategory = "general", StreetName = "Sahil bağı", Description = "Velosiped və skuterlərin piyada zolağına daxil olması qadağandır",
                SpeedLimit = 0, PreviousSpeedLimit = 0, IsTemporary = false, Reason = "Təhlükəsizlik", RadarActive = false,
                ActiveFrom = DateTime.UtcNow.AddMonths(-2) },
            new TrafficRule { TargetRole = "pedestrian", RuleCategory = "location", StreetName = "28 May küçəsi", Description = "Təmir səbəbindən piyada keçidi 50 metr irəli çəkilib",
                SpeedLimit = 0, PreviousSpeedLimit = 0, IsTemporary = true, Reason = "Yol təmiri", RadarActive = false,
                ActiveFrom = DateTime.UtcNow.AddDays(-1), ActiveTo = DateTime.UtcNow.AddDays(10) }
        );

        // Coupons
        db.Coupons.AddRange(
            new Coupon { PartnerName = "Bravo Supermarket", PartnerLogo = "🛒", Description = "Bravo marketdə alış-verişə endirim", Discount = "5%", EcoPointsCost = 100 },
            new Coupon { PartnerName = "SOCAR", PartnerLogo = "⛽", Description = "SOCAR yanacaqdoldurma stansiyasında pulsuz yanacaq", Discount = "10 AZN", EcoPointsCost = 250 },
            new Coupon { PartnerName = "Bolt", PartnerLogo = "🚕", Description = "Bolt taksi xidmətinə endirim", Discount = "20%", EcoPointsCost = 150 },
            new Coupon { PartnerName = "Park Cinema", PartnerLogo = "🎬", Description = "Park Cinema-da bilet endirimi", Discount = "50%", EcoPointsCost = 200 },
            new Coupon { PartnerName = "Wolt", PartnerLogo = "🍕", Description = "Wolt sifarişinə endirim", Discount = "30%", EcoPointsCost = 120 }
        );

        // Default user
        db.Users.Add(new User { Name = "Demo Sürücü", Role = "driver", EcoPoints = 350, Level = 3 });
        db.UserStats.Add(new UserStats { UserId = 1, TimeSavedMinutes = 312, FuelSavedPercent = 18.5, EmergencyYields = 4, Violations = 0, TripsCount = 47 });

        // Simulated vehicles on Baku roads
        db.SimulatedVehicles.AddRange(
            new SimulatedVehicle { Type = "car", Lat = 40.3780, Lng = 49.8500, Speed = 45, Heading = 180,
                RouteJson = "[[49.8500,40.3780],[49.8480,40.3770],[49.8460,40.3760],[49.8440,40.3750]]" },
            new SimulatedVehicle { Type = "car", Lat = 40.4090, Lng = 49.8670, Speed = 55, Heading = 270,
                RouteJson = "[[49.8670,40.4090],[49.8650,40.4085],[49.8630,40.4080],[49.8610,40.4075]]" },
            new SimulatedVehicle { Type = "bus", Lat = 40.3950, Lng = 49.8820, Speed = 35, Heading = 90,
                RouteJson = "[[49.8820,40.3950],[49.8840,40.3955],[49.8860,40.3960],[49.8880,40.3965]]" },
            new SimulatedVehicle { Type = "car", Lat = 40.4175, Lng = 49.9310, Speed = 65, Heading = 180,
                RouteJson = "[[49.9310,40.4175],[49.9300,40.4160],[49.9290,40.4145],[49.9280,40.4130]]" },
            new SimulatedVehicle { Type = "ambulance", Lat = 40.4100, Lng = 49.8700, Speed = 80, Heading = 180,
                RouteJson = "[[49.8700,40.4100],[49.8690,40.4080],[49.8680,40.4060],[49.8670,40.4040]]" },
            new SimulatedVehicle { Type = "car", Lat = 40.3700, Lng = 49.8360, Speed = 30, Heading = 0,
                RouteJson = "[[49.8360,40.3700],[49.8360,40.3720],[49.8360,40.3740],[49.8360,40.3760]]" },
            new SimulatedVehicle { Type = "car", Lat = 40.3825, Lng = 49.8430, Speed = 40, Heading = 90,
                RouteJson = "[[49.8430,40.3825],[49.8450,40.3830],[49.8470,40.3835],[49.8490,40.3840]]" },
            new SimulatedVehicle { Type = "bus", Lat = 40.4050, Lng = 49.9060, Speed = 30, Heading = 270,
                RouteJson = "[[49.9060,40.4050],[49.9040,40.4045],[49.9020,40.4040],[49.9000,40.4035]]" }
        );

        db.SaveChanges();
    }
}
