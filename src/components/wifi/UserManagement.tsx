import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  Phone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserManagementProps {
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  phone: string;
  plan: "daily" | "weekly" | "monthly";
  status: "active" | "expired" | "warning";
  connectedAt?: Date;
  expiresAt: Date;
  totalPaid: number;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Mugisha",
    phone: "+256701234567",
    plan: "weekly",
    status: "active",
    connectedAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    totalPaid: 15000,
  },
  {
    id: "2", 
    name: "Sarah Nakato",
    phone: "+256702345678",
    plan: "monthly",
    status: "warning",
    connectedAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    totalPaid: 45000,
  },
  {
    id: "3",
    name: "Moses Kiprotich",
    phone: "+256703456789", 
    plan: "daily",
    status: "expired",
    expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    totalPaid: 8000,
  },
  {
    id: "4",
    name: "Grace Auma",
    phone: "+256704567890",
    plan: "weekly", 
    status: "active",
    connectedAt: new Date(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    totalPaid: 12000,
  },
];

export function UserManagement({ onClose }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-white">Active</Badge>;
      case "expired":
        return <Badge className="bg-destructive text-white">Expired</Badge>;
      case "warning":
        return <Badge className="bg-warning text-white">Expiring</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDisconnectUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: "expired" as const, connectedAt: undefined }
        : user
    ));
    toast({
      title: "User Disconnected",
      description: "User has been disconnected from the network",
    });
  };

  const handleExtendUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            status: "active" as const, 
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            connectedAt: new Date()
          }
        : user
    ));
    toast({
      title: "User Extended",
      description: "User subscription has been extended by 1 day",
    });
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    warning: users.filter(u => u.status === "warning").length,
    expired: users.filter(u => u.status === "expired").length,
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </DialogTitle>
          <DialogDescription>
            Monitor and manage all WiFi users and their subscriptions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{stats.warning}</div>
                <div className="text-sm text-muted-foreground">Expiring</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
                <div className="text-sm text-muted-foreground">Expired</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter">Filter Status</Label>
              <select
                id="filter"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="warning">Expiring</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time Remaining</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(user.status)}
                            {getStatusBadge(user.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getTimeRemaining(user.expiresAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            UGX {user.totalPaid.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {user.status === "active" && (
                                <DropdownMenuItem 
                                  onClick={() => handleDisconnectUser(user.id)}
                                  className="text-destructive"
                                >
                                  Disconnect User
                                </DropdownMenuItem>
                              )}
                              {user.status !== "active" && (
                                <DropdownMenuItem 
                                  onClick={() => handleExtendUser(user.id)}
                                  className="text-success"
                                >
                                  Extend 1 Day
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}