import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockUsers, User, addAuditLog } from '@/lib/mockData';
import { Search, UserX, Shield, Calendar, DollarSign, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockDialog, setBlockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const updateUserStatus = (userId: string, status: User['status'], reason?: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status } : u)));
    const action = `Changed user ${userId} status to ${status}${reason ? `: ${reason}` : ''}`;
    addAuditLog('Update User Status', action);
    toast.success(`User ${status}`);
    setBlockDialog(false);
    setBlockReason('');
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'suspended':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'blocked':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor platform users</p>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{user.id}</p>
                  <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(user.joinedAt, 'MMM dd, yyyy')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-border">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Bookings</p>
                  <p className="font-bold text-foreground">{user.totalBookings}</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3 text-success" />
                    <p className="font-bold text-foreground">{(user.totalSpent / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>

              {user.status === 'active' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateUserStatus(user.id, 'suspended')}
                  >
                    Suspend
                  </Button>
                  <Dialog open={blockDialog && selectedUser?.id === user.id} onOpenChange={setBlockDialog}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setSelectedUser(user)}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Block User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason for blocking</Label>
                          <Textarea
                            id="reason"
                            placeholder="Enter reason..."
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => updateUserStatus(user.id, 'blocked', blockReason)}
                          disabled={!blockReason.trim()}
                        >
                          Confirm Block
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {user.status === 'suspended' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateUserStatus(user.id, 'active')}
                  >
                    Reactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setSelectedUser(user);
                      setBlockDialog(true);
                    }}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Block
                  </Button>
                </div>
              )}

              {user.status === 'blocked' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => updateUserStatus(user.id, 'active')}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Unblock User
                </Button>
              )}
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
