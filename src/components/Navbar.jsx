import { Activity, ShieldAlert, BarChart3, Radio } from 'lucide-react'

export function Navbar({ vistaActual, setVistaActual, conectado }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, activeColor: 'bg-blue-600 shadow-blue-600/30' },
        { id: 'triage', label: 'Nuevo Triaje', icon: ShieldAlert, activeColor: 'bg-rose-600 shadow-rose-600/30' },
        { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3, activeColor: 'bg-indigo-600 shadow-indigo-600/30' },
    ]

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                {/* Logo / Brand */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-600/25">
                        <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-white tracking-wide flex items-center gap-1.5">
                            RedTriage
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                v2.0
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 font-medium">Sistema Inteligente de Derivación Hospitalaria</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex items-center gap-1 p-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = vistaActual === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setVistaActual(item.id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive
                                        ? `${item.activeColor} text-white shadow-md`
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* Live Status Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/60 text-xs font-medium">
                    <Radio className={`w-3.5 h-3.5 ${conectado ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className={conectado ? 'text-emerald-400' : 'text-slate-400'}>
                        {conectado ? 'WS En Vivo' : 'Desconectado'}
                    </span>
                </div>
            </div>
        </header>
    )
}