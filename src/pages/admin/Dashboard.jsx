import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import {
  Users,
  Layers,
  CalendarDays,
  Activity,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    activeSessions: 0,
    totalLogs: 0,
  });
  const [trendData, setTrendData] = useState([]);
  const [classDistData, setClassDistData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // 1. Fetch Basic Stats (Counts)
      const { count: classCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true });
      const { count: studentCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      const { count: sessionCount } = await supabase
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      const { count: logCount } = await supabase
        .from("attendance_logs")
        .select("*", { count: "exact", head: true });

      setStats({
        classes: classCount || 0,
        students: studentCount || 0,
        activeSessions: sessionCount || 0,
        totalLogs: logCount || 0,
      });

      // 2. Fetch Data for Attendance Trend (Last 7 Sessions)
      const { data: logs } = await supabase
        .from("attendance_logs")
        .select(`id, sessions(session_date)`);

      if (logs) {
        const trendMap = {};
        logs.forEach((log) => {
          const dateStr = log.sessions?.session_date;
          if (dateStr) {
            trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
          }
        });

        // Urutkan tanggal dan ambil 7 hari terakhir
        const formattedTrend = Object.keys(trendMap)
          .sort()
          .slice(-7)
          .map((date) => ({
            date: new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            Attendance: trendMap[date],
          }));
        setTrendData(formattedTrend);
      }

      // 3. Fetch Data for Class Distribution
      const { data: studentsData } = await supabase
        .from("students")
        .select(`id, classes(name)`);

      if (studentsData) {
        const distMap = {};
        studentsData.forEach((std) => {
          const className = std.classes?.name || "Unassigned";
          distMap[className] = (distMap[className] || 0) + 1;
        });

        const formattedDist = Object.keys(distMap)
          .map((key) => ({
            name: key,
            Athletes: distMap[key],
          }))
          .sort((a, b) => b.Athletes - a.Athletes); // Urutkan dari terbanyak

        setClassDistData(formattedDist);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Komponen Card Statistik
  const StatCard = ({ title, value, icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bgClass} ${colorClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      </div>
    </div>
  );

  // Palet Warna untuk Bar Chart
  const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Analyzing dashboard metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Overview
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Real-time statistics and club performance metrics.
        </p>
      </div>

      {/* Top Statistic Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Athletes"
          value={stats.students}
          icon={<Users size={24} />}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Total Classes"
          value={stats.classes}
          icon={<Layers size={24} />}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-50"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={<CalendarDays size={24} />}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatCard
          title="Total Scans"
          value={stats.totalLogs}
          icon={<Activity size={24} />}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Chart 1: Attendance Trends */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Attendance Trends
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Last 7 recorded sessions
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="flex-1 w-full mt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorAttendance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{
                      stroke: "#cbd5e1",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Attendance"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No attendance data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Class Distribution */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Athlete Distribution
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Number of athletes per class
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <BarChart3 size={20} />
            </div>
          </div>

          <div className="flex-1 w-full mt-4">
            {classDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classDistData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="Athletes" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {classDistData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No class data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
