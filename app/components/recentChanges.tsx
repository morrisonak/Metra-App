import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function RecentChanges() {
  const changes = [
    {
      id: 1,
      crossing: "Crossing #123456",
      user: "John Doe",
      userInitials: "JD",
      action: "Updated warning devices",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      crossing: "Crossing #789012",
      user: "Jane Smith",
      userInitials: "JS",
      action: "Added new photos",
      timestamp: "3 hours ago",
    },
    {
      id: 3,
      crossing: "Crossing #345678",
      user: "Mike Johnson",
      userInitials: "MJ",
      action: "Updated traffic counts",
      timestamp: "5 hours ago",
    },
    {
      id: 4,
      crossing: "Crossing #901234",
      user: "Sarah Williams",
      userInitials: "SW",
      action: "Completed field verification",
      timestamp: "Yesterday",
    },
    {
      id: 5,
      crossing: "Crossing #567890",
      user: "Robert Brown",
      userInitials: "RB",
      action: "Updated location data",
      timestamp: "Yesterday",
    },
  ];

  return (
    <div className="space-y-8">
      {changes.map((change) => (
        <div className="flex items-center" key={change.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatar.jpg`} alt={change.user} />
            <AvatarFallback>{change.userInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{change.crossing}</p>
            <p className="text-sm text-muted-foreground">
              {change.user} {change.action}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground">{change.timestamp}</div>
        </div>
      ))}
    </div>
  );
}