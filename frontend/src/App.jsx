import React, { useEffect, useState } from "react";
import axios from "axios";
import { Server, Activity, Cpu, HardDrive, Bell, Settings, Gamepad2, Search, Plus, Play, Square, RotateCcw, Terminal, MoreVertical, Shield, Database, Wifi, AlertTriangle, CheckCircle2, XCircle, BarChart3 } from "lucide-react";

const API_BASE_URL = "http://13.214.8.10:8000";

const servers = [
  // { id: 1, name: "Win-VPS-01", ip: "103.123.45.67", os: "Windows Server 2022", status: "online", cpu: 35, ram: 62, disk: 48, uptime: "12h 30m" },
  // { id: 2, name: "Win-VPS-02", ip: "103.123.45.68", os: "Windows Server 2022", status: "online", cpu: 22, ram: 45, disk: 41, uptime: "8h 10m" },
  // { id: 3, name: "Win-VPS-03", ip: "103.123.45.69", os: "Windows Server 2019", status: "warning", cpu: 68, ram: 80, disk: 72, uptime: "5h 23m" },
  // { id: 4, name: "Win-VPS-04", ip: "103.123.45.70", os: "Windows Server 2022", status: "online", cpu: 18, ram: 33, disk: 29, uptime: "1d 2h" },
  // { id: 5, name: "Win-VPS-05", ip: "103.123.45.71", os: "Windows Server 2019", status: "offline", cpu: 0, ram: 0, disk: 0, uptime: "-" },
];

const apps = [
  { id: 1, name: "Ninja School Client 01", server: "Win-VPS-01", status: "running", cpu: 12, ram: "512 MB", autoRestart: true },
  { id: 2, name: "Ninja School Client 02", server: "Win-VPS-01", status: "running", cpu: 8, ram: "256 MB", autoRestart: true },
  { id: 3, name: "Bot Treo Game 01", server: "Win-VPS-03", status: "running", cpu: 31, ram: "820 MB", autoRestart: true },
  { id: 4, name: "Auto Login Script", server: "Win-VPS-04", status: "stopped", cpu: 0, ram: "0 MB", autoRestart: false },
];

const logs = [
  { type: "info", message: "Win-VPS-01 restarted successfully", time: "2 minutes ago" },
  { type: "warning", message: "RAM usage > 80% on Win-VPS-03", time: "10 minutes ago" },
  { type: "error", message: "Win-VPS-05 is offline", time: "1 hour ago" },
  { type: "info", message: "Ninja School Client 01 started", time: "2 hours ago" },
];

function statusStyle(status) {
  if (status === "online" || status === "running") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "warning") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/15 text-red-400 border-red-500/30";
}

function ProgressBar({ value }) {
  const color = value >= 80 ? "bg-red-500" : value >= 65 ? "bg-yellow-400" : "bg-blue-500";
  return (
    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Sidebar({ page, setPage }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "servers", label: "Servers", icon: Server },
    { id: "apps", label: "Apps / Games", icon: Gamepad2 },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "logs", label: "Logs & Alerts", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-72 min-h-screen border-r border-slate-800 bg-slate-950/80 p-5 hidden lg:block">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">KianOps Panel</h1>
          <p className="text-xs text-slate-400">Windows VPS Manager</p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs text-slate-400">Current user</p>
        <p className="mt-1 font-semibold text-white">Kian Admin</p>
        <p className="text-xs text-emerald-400 mt-1">System healthy</p>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-4 sticky top-0 z-10 backdrop-blur-xl">
      <div>
        <h2 className="text-lg font-semibold text-white">Control Center</h2>
        <p className="text-sm text-slate-400">Manage Windows VPS, apps, monitoring and alerts</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-400">
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
        </div>
        <button className="relative rounded-2xl border border-slate-800 bg-slate-900 p-3 text-slate-300 hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const tones = {
    blue: "from-blue-600/20 to-blue-950/20 border-blue-500/20 text-blue-400",
    green: "from-emerald-600/20 to-emerald-950/20 border-emerald-500/20 text-emerald-400",
    red: "from-red-600/20 to-red-950/20 border-red-500/20 text-red-400",
    purple: "from-purple-600/20 to-purple-950/20 border-purple-500/20 text-purple-400",
    yellow: "from-yellow-600/20 to-yellow-950/20 border-yellow-500/20 text-yellow-400",
  };

  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/40 p-3">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [liveServers, setLiveServers] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);


  useEffect(() => {
    fetchMetric();

    const timer = setInterval(fetchMetric, 3000);

    return () => clearInterval(timer);
  }, []);

  async function fetchMetric() {
    try {
      const dashboardRes = await axios.get(`${API_BASE_URL}/dashboard`);
      const serversRes = await axios.get(`${API_BASE_URL}/servers`);
      const logsRes = await axios.get(`${API_BASE_URL}/logs`);
      setLiveLogs(logsRes.data);

    setDashboard(dashboardRes.data);
    setLiveServers(serversRes.data);
  } catch (error) {
    console.log("Cannot fetch dashboard data", error);
  }
  }

  async function sendCommand(workerId, action) {
      try {
        await axios.post(`${API_BASE_URL}/commands/${workerId}`, {
          action,
        });

        alert(`Command ${action} sent to ${workerId}`);
      } catch (error) {
        console.log("Cannot send command", error);
        alert("Send command failed");
      }
    }

  const displayServers = liveServers.length > 0 ? liveServers : servers;
  // const displayServers = liveMetric
  //   ? [
  //       {
  //         id: 1,
  //         name: liveMetric.hostname || "Worker-01",
  //         ip: "Windows Worker",
  //         os: "Windows",
  //         status: "online",
  //         cpu: Number(liveMetric.cpu || 0),
  //         ram: Number(liveMetric.ram || 0),
  //         disk: 0,
  //         uptime: "Live",
  //       },
  //       ...servers.slice(1),
  //     ]
  //   : servers;

  return (
    <main className="p-6 space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Total Servers" value={dashboard?.total_servers ?? 0} subtitle="All workers" icon={Server} tone="blue" />
        <StatCard title="Online" value={dashboard?.online ?? 0} subtitle="Active workers" icon={CheckCircle2} tone="green" />
        <StatCard title="Offline" value={dashboard?.offline ?? 0} subtitle="No recent heartbeat" icon={XCircle} tone="red" />
        <StatCard title="CPU Average" value={`${dashboard?.cpu_avg ?? 0}%`} subtitle="Online workers" icon={Cpu} tone="purple" />
        <StatCard title="RAM Average" value={`${dashboard?.ram_avg ?? 0}%`} subtitle="Online workers" icon={Database} tone="yellow" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Server Status</h3>
            <button className="text-sm text-blue-400">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-slate-800">  
                  <th className="text-left py-3">Server</th>
                  <th className="text-left py-3">IP</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">CPU</th>
                  <th className="text-left py-3">RAM</th>
                  <th className="text-left py-3">Uptime</th>
                  <th className="text-left py-3">App</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayServers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/60 text-slate-300">
                    <td className="py-3 font-medium text-blue-400">{s.name}</td>
                    <td>{s.ip}</td>
                    <td><span className={`rounded-xl border px-2 py-1 text-xs ${statusStyle(s.status)}`}>{s.status}</span></td>
                    <td>{s.cpu ? `${s.cpu}%` : "-"}</td>
                    <td>{s.ram ? `${s.ram}%` : "-"}</td>
                    <td>{s.uptime}</td>
                    <td>
                    <span
                    className={
                    s.app_status===
                    "running"
                    ?
                    "text-emerald-400"
                    :
                    "text-red-400"
                    }
                    >

                    <span>
                      {s.app_status === "running" ? "🟢" : "🔴"}
                    </span>

                    </span>
                    </td>

                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendCommand(s.id, "start")}
                          className="rounded-lg bg-emerald-600/20 px-2 py-1 text-xs text-emerald-300"
                        >
                          Start
                        </button>

                        <button
                          onClick={() => sendCommand(s.id, "stop")}
                          className="rounded-lg bg-red-600/20 px-2 py-1 text-xs text-red-300"
                        >
                          Stop
                        </button>

                        <button
                          onClick={() => sendCommand(s.id, "restart")}
                          className="rounded-lg bg-yellow-600/20 px-2 py-1 text-xs text-yellow-300"
                        >
                          Restart
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {(liveLogs.length > 0 ? liveLogs : logs).map((log,index) => (
              <div key={index} className="flex gap-3 rounded-2xl bg-slate-950/60 p-3">
                {log.type === "error" ? <XCircle className="h-5 w-5 text-red-400" /> : log.type === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                <div>
                  <p className="text-sm text-white">{log.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ServersPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Servers</h2>
          <p className="text-slate-400">Manage all Windows VPS instances</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500">
          <Plus className="h-4 w-4" /> Add Server
        </button>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="grid grid-cols-1 gap-4">
          {servers.map((s) => (
            <div key={s.id} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-blue-600/15 p-3 text-blue-400"><Server className="h-6 w-6" /></div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <span className={`rounded-xl border px-2 py-1 text-xs ${statusStyle(s.status)}`}>{s.status}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{s.ip} · {s.os}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:w-[520px]">
                  <div><p className="text-xs text-slate-500">CPU</p><p className="text-white font-semibold">{s.cpu}%</p><ProgressBar value={s.cpu} /></div>
                  <div><p className="text-xs text-slate-500">RAM</p><p className="text-white font-semibold">{s.ram}%</p><ProgressBar value={s.ram} /></div>
                  <div><p className="text-xs text-slate-500">Disk</p><p className="text-white font-semibold">{s.disk}%</p><ProgressBar value={s.disk} /></div>
                  <div><p className="text-xs text-slate-500">Uptime</p><p className="text-white font-semibold">{s.uptime}</p></div>
                </div>
                <button className="rounded-2xl border border-slate-800 p-3 text-slate-300 hover:text-white"><MoreVertical className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function AppsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Apps / Games Manager</h2>
          <p className="text-slate-400">Start, stop and monitor running apps</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add App</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {apps.map((app) => (
          <div key={app.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-2xl bg-purple-600/15 p-3 text-purple-400"><Gamepad2 className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-semibold text-white">{app.name}</h3>
                  <p className="text-sm text-slate-400">Server: {app.server}</p>
                  <p className="text-sm text-slate-500 mt-1">Auto Restart: {app.autoRestart ? "ON" : "OFF"}</p>
                </div>
              </div>
              <span className={`rounded-xl border px-2 py-1 text-xs ${statusStyle(app.status)}`}>{app.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="rounded-2xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">CPU</p><p className="text-white font-semibold">{app.cpu}%</p></div>
              <div className="rounded-2xl bg-slate-950/60 p-3"><p className="text-xs text-slate-500">RAM</p><p className="text-white font-semibold">{app.ram}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              <button className="rounded-xl bg-emerald-600/20 px-3 py-2 text-sm text-emerald-300 flex items-center gap-2"><Play className="h-4 w-4" />Start</button>
              <button className="rounded-xl bg-red-600/20 px-3 py-2 text-sm text-red-300 flex items-center gap-2"><Square className="h-4 w-4" />Stop</button>
              <button className="rounded-xl bg-yellow-600/20 px-3 py-2 text-sm text-yellow-300 flex items-center gap-2"><RotateCcw className="h-4 w-4" />Restart</button>
              <button className="rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-300 flex items-center gap-2"><Terminal className="h-4 w-4" />Logs</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function MonitoringPage() {
  const chartBars = [35, 42, 38, 51, 47, 62, 55, 70, 64, 58, 76, 69, 61, 82, 75, 88, 80, 73, 91, 86];
  return (
    <main className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Monitoring</h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {["CPU Usage", "RAM Usage", "Network In/Out"].map((title, index) => (
          <div key={title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{index === 0 ? "36%" : index === 1 ? "61%" : "24 MB/s"}</p>
            <div className="mt-6 flex h-40 items-end gap-2">
              {chartBars.map((bar, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-blue-500/70" style={{ height: `${bar}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function LogsPage() {
  return (
    <main className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Logs & Alerts</h2>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="space-y-3">
          {[...logs, ...logs].map((log, index) => (
            <div key={index} className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-4">
              <div className="flex items-center gap-3">
                {log.type === "error" ? <XCircle className="h-5 w-5 text-red-400" /> : log.type === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                <p className="text-white">{log.message}</p>
              </div>
              <span className="text-sm text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SettingsPage() {
  return (
    <main className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {[
          { icon: Shield, title: "Account & Security", desc: "Manage profile, password and access control" },
          { icon: Database, title: "API Keys", desc: "Create API keys for agents and integrations" },
          { icon: Bell, title: "Notifications", desc: "Configure Telegram, Discord and email alerts" },
          { icon: Wifi, title: "Integrations", desc: "Connect cloud providers and monitoring tools" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex gap-4">
              <div className="rounded-2xl bg-blue-600/15 p-3 text-blue-400 h-fit"><Icon className="h-6 w-6" /></div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_35%)]" />
      <div className="relative flex">
        <Sidebar page={page} setPage={setPage} />
        <div className="flex-1 min-w-0">
          <Header />
          {page === "dashboard" && <Dashboard />}
          {page === "servers" && <ServersPage />}
          {page === "apps" && <AppsPage />}
          {page === "monitoring" && <MonitoringPage />}
          {page === "logs" && <LogsPage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}
