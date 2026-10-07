import { useState } from 'react'
import { Activity, ShieldAlert, BarChart3, Radio, Sun, Moon, Building2, Menu, X } from 'lucide-react'

export function Navbar({ vistaActual, setVistaActual, conectado, darkMode, setDarkMode }) {
    const [menuAbierto, setMenuAbierto] = useState(false)

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, activeColor: 'bg-blue-600 shadow-blue-600/30 text-white' },
        { id: 'triage', label: 'Nuevo Triaje', icon: ShieldAlert, activeColor: 'bg-rose-600 shadow-rose-600/30 text-white' },
        { id: 'gestion_hospitales', label: 'Hospitales', icon: Building2, activeColor: 'bg-emerald-600 shadow-emerald-600/30 text-white' },
        { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3, activeColor: 'bg-indigo-600 shadow-indigo-600/30 text-white' },
    ]

    return (
        <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-300 bg-white/80 shadow-sm'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                {/* Logo e Título */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-600/25">
                        <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className={`text-lg font-extrabold tracking-wide ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            RedTriage
                        </h1>
                        <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Sistema Inteligente de Derivación
                        </p>
                    </div>
                </div>

                {/* Navegación para Pantallas Medianas y Grandes (Desktop) */}
                <nav className={`hidden md:flex items-center gap-1 p-1.5 rounded-xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-200/70 border-slate-300'
                    }`}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = vistaActual === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setVistaActual(item.id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive
                                    ? `${item.activeColor} shadow-md`
                                    : darkMode
                                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* Acciones y Botón de Menú Móvil */}
                <div className="flex items-center gap-2.5">
                    {/* Botón Tema Claro/Oscuro */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${darkMode
                            ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                            : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                            }`}
                        title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                    >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Indicador de Estado Socket */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-200/60 border-slate-300'
                        }`}>
                        <Radio className={`w-3.5 h-3.5 ${conectado ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                        <span className={conectado ? 'text-emerald-500' : 'text-slate-500'}>
                            {conectado ? 'En Vivo' : 'Inactivo'}
                        </span>
                    </div>

                    {/* Botón Hamburgesa para Teléfonos */}
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className={`p-2 rounded-xl border md:hidden transition-all cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                            }`}
                        aria-label="Abrir menú de navegación"
                    >
                        {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Menú Desplegable Móvil */}
                {menuAbierto && (
                    <div className={`w-full md:hidden flex flex-col gap-1.5 pt-3 pb-1 border-t transition-all ${darkMode ? 'border-slate-800/80' : 'border-slate-200'
                        }`}>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = vistaActual === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setVistaActual(item.id)
                                        setMenuAbierto(false)
                                    }}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                                        ? `${item.activeColor} shadow-md`
                                        : darkMode
                                            ? 'text-slate-300 hover:bg-slate-800'
                                            : 'text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </header>
    )
}