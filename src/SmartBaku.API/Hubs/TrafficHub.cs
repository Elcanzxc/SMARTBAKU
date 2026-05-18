using Microsoft.AspNetCore.SignalR;

namespace SmartBaku.API.Hubs;

public class TrafficHub : Hub
{
    public async Task JoinRole(string role)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, role);
        await Clients.Caller.SendAsync("RoleJoined", role);
    }

    public async Task RequestCrossing(double lat, double lng)
    {
        // Simulate traffic light processing time (3-5 seconds for demo wow effect)
        var waitTime = new Random().Next(3, 6);
        await Clients.All.SendAsync("CrossingRequested", new { waitTime, lat, lng });

        _ = Task.Run(async () =>
        {
            await Task.Delay(waitTime * 1000);
            await Clients.All.SendAsync("CrossingGranted", new
            {
                message = "Keçə bilərsiniz!",
                lat, lng
            });
            
            // Turn off crossing after 10 seconds
            await Task.Delay(10000);
            await Clients.All.SendAsync("CrossingEnded", new { lat, lng });
        });
    }

    public async Task RequestEmergencyRoute()
    {
        // Broadcast to all drivers in the area
        await Clients.Group("driver").SendAsync("EmergencyApproaching", new
        {
            message = "Diqqət! Arxadan təcili yardım yaxınlaşır, sağ zolağa keçin!",
            distance = 300
        });
    }

    public async Task SendLocation(double lat, double lng, string role)
    {
        await Clients.Others.SendAsync("UserLocationUpdate", new { connectionId = Context.ConnectionId, lat, lng, role });
    }
}
