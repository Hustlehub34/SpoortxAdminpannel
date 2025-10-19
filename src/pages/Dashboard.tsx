import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Users, MapPin, Calendar, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, Sparkles } from 'lucide-react';
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
      color: 'from-indigo-500 to-purple-600',
      glowColor: 'rgba(99, 102, 241, 0.3)',
    },
    {
      name: 'Revenue Today',
      value: `₹${(totalRevenue / 1000).toFixed(1)}K`,
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.3)',
    },
    {
      name: 'Active Turfs',
      value: activeTurfs.toString(),
      change: '+3',
      trend: 'up',
      icon: MapPin,
      color: 'from-violet-500 to-purple-600',
      glowColor: 'rgba(139, 92, 246, 0.3)',
    },
    {
      name: 'Pending Settlements',
      value: `₹${(pendingSettlements / 1000).toFixed(1)}K`,
      change: '-5%',
      trend: 'down',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      glowColor: 'rgba(245, 158, 11, 0.3)',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header with Enhanced Typography */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary animate-glow-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Dashboard Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
              Welcome back, Admin
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Here's what's happening with your turf booking platform today
            </p>
          </div>
        </div>

        {/* Enhanced Stats Grid with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow Effect */}
              <div
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{ background: stat.glowColor }}
              />
              
              <Card className="relative p-6 backdrop-blur-sm bg-card/80 border-border/50 hover:border-border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl overflow-hidden group">
                {/* Gradient Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <div className={`w-full h-full bg-gradient-to-br ${stat.color} rounded-full blur-2xl`} />
                </div>

                <div className="relative flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          stat.trend === 'up' ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          {stat.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-success" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                          )}
                          <span className={`text-xs font-semibold ${
                            stat.trend === 'up' ? 'text-success' : 'text-destructive'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">vs last week</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced Activity Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="p-8 backdrop-blur-sm bg-card/80 border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Recent Bookings</h3>
                <p className="text-sm text-muted-foreground">Latest customer activity</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              {mockBookings.slice(0, 5).map((booking, index) => (
                <div
                  key={booking.id}
                  className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30 hover:from-secondary/70 hover:to-secondary/50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-border/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                      {booking.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{booking.userName}</p>
                      <p className="text-xs text-muted-foreground">{booking.turfName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-success">₹{booking.amount}</p>
                    <p className="text-xs text-muted-foreground">{booking.time}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </Card>

          {/* Top Performing Turfs */}
          <Card className="p-8 backdrop-blur-sm bg-card/80 border-border/50 hover:border-border transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Top Performing Turfs</h3>
                <p className="text-sm text-muted-foreground">Highest revenue generators</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              {mockTurfs
                .sort((a, b) => b.revenue30d - a.revenue30d)
                .slice(0, 5)
                .map((turf, index) => (
                  <div
                    key={turf.id}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30 hover:from-secondary/70 hover:to-secondary/50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-border/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{turf.name}</p>
                      <p className="text-xs text-muted-foreground">{turf.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent">
                        ₹{(turf.revenue30d / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-muted-foreground">{turf.totalBookings30d} bookings</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
