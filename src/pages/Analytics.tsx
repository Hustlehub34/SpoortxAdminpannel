import AdminLayout from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBookings, mockTurfs } from '@/lib/mockData';
import { TrendingUp, Download, Calendar, DollarSign, Users, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30d');

  const totalRevenue = mockBookings.reduce((sum, b) => sum + b.amount, 0);
  const totalBookings = mockBookings.length;
  const activeTurfs = mockTurfs.filter((t) => t.status === 'active').length;
  const avgBookingValue = totalRevenue / totalBookings;

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  const chartData = [
    { date: 'Mon', bookings: 12, revenue: 18000 },
    { date: 'Tue', bookings: 15, revenue: 22500 },
    { date: 'Wed', bookings: 18, revenue: 27000 },
    { date: 'Thu', bookings: 14, revenue: 21000 },
    { date: 'Fri', bookings: 22, revenue: 33000 },
    { date: 'Sat', bookings: 28, revenue: 42000 },
    { date: 'Sun', bookings: 25, revenue: 37500 },
  ];

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">Track performance and generate insights</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-foreground">{totalBookings}</p>
            <p className="text-xs text-success mt-1">+12% vs last period</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success to-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">₹{(totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-success mt-1">+8% vs last period</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Active Turfs</p>
            <p className="text-3xl font-bold text-foreground">{activeTurfs}</p>
            <p className="text-xs text-success mt-1">+2 new this month</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning to-yellow-400 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Avg Booking Value</p>
            <p className="text-3xl font-bold text-foreground">₹{avgBookingValue.toFixed(0)}</p>
            <p className="text-xs text-success mt-1">+5% vs last period</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Revenue Trend</h3>
            <div className="space-y-3">
              {chartData.map((day, index) => (
                <div key={day.date} className="space-y-2" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day.date}</span>
                    <span className="text-success font-semibold">₹{(day.revenue / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full transition-all duration-500 animate-scale-in"
                      style={{
                        width: `${(day.revenue / maxRevenue) * 100}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bookings Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Booking Trend</h3>
            <div className="space-y-3">
              {chartData.map((day, index) => (
                <div key={day.date} className="space-y-2" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day.date}</span>
                    <span className="text-primary font-semibold">{day.bookings} bookings</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-500 animate-scale-in"
                      style={{
                        width: `${(day.bookings / Math.max(...chartData.map((d) => d.bookings))) * 100}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Performing Turfs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Turfs</h3>
          <div className="space-y-3">
            {mockTurfs
              .sort((a, b) => b.revenue30d - a.revenue30d)
              .map((turf, index) => (
                <div
                  key={turf.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{turf.name}</p>
                    <p className="text-sm text-muted-foreground">{turf.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">₹{(turf.revenue30d / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-muted-foreground">{turf.totalBookings30d} bookings</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
