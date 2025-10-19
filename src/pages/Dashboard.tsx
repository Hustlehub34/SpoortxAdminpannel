import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { mockTurfs, mockBookings, mockTurfOwners } from '@/lib/mockData';

const Dashboard = () => {
  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.amount, 0);
  const activeBookings = mockBookings.filter((b) => b.status === 'confirmed').length;
  const activeTurfs = mockTurfs.filter((t) => t.status === 'active').length;
  const pendingSettlements = mockTurfOwners.reduce((sum, o) => sum + o.pendingSettlements, 0);

  const stats = [
    {
      name: 'Today\'s Bookings',
      value: activeBookings.toString(),
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'from-primary to-primary-glow',
    },
    {
      name: 'Revenue Today',
      value: `₹${(totalRevenue / 1000).toFixed(1)}K`,
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-success to-emerald-400',
    },
    {
      name: 'Active Turfs',
      value: activeTurfs.toString(),
      change: '+3',
      trend: 'up',
      icon: MapPin,
      color: 'from-accent to-purple-400',
    },
    {
      name: 'Pending Settlements',
      value: `₹${(pendingSettlements / 1000).toFixed(1)}K`,
      change: '-5%',
      trend: 'down',
      icon: Users,
      color: 'from-warning to-yellow-400',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={stat.name}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border bg-gradient-to-br from-card to-secondary/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">vs last week</span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {mockBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{booking.userName}</p>
                    <p className="text-xs text-muted-foreground">{booking.turfName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{booking.amount}</p>
                    <p className="text-xs text-muted-foreground">{booking.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Turfs</h3>
            <div className="space-y-3">
              {mockTurfs
                .sort((a, b) => b.revenue30d - a.revenue30d)
                .slice(0, 5)
                .map((turf, index) => (
                  <div
                    key={turf.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{turf.name}</p>
                      <p className="text-xs text-muted-foreground">{turf.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{(turf.revenue30d / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground">{turf.totalBookings30d} bookings</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
