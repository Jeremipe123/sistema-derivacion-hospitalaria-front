import { useState } from 'react'
import { Activity, ShieldAlert, BarChart3, Radio, Sun, Moon, Building2, ShieldCheck, Users, LogIn, LogOut, Menu, X } from 'lucide-react'

export function Navbar({ vistaActual, setVistaActual, conectado, darkMode, setDarkMode, usuario, onLogout }) {
    const [menuAbierto, setMenuAbierto] = useState(false)
    const rol = usuario?.rol || 'visitante'

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity, activeColor: 'bg-blue-600 shadow-blue-600/30 text-white', permitir: ['admin', 'coordinador', 'evaluador', 'visitante'] },
        { id: 'triage', label: 'Nuevo Triaje', icon: ShieldAlert, activeColor: 'bg-rose-600 shadow-rose-600/30 text-white', permitir: ['admin', 'coordinador', 'evaluador', 'visitante'] },
        { id: 'gestion_hospitales', label: 'Hospitales', icon: Building2, activeColor: 'bg-emerald-600 shadow-emerald-600/30 text-white', permitir: ['admin', 'coordinador', 'evaluador'] },
        { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3, activeColor: 'bg-indigo-600 shadow-indigo-600/30 text-white', permitir: ['admin', 'coordinador', 'evaluador'] },
        { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck, activeColor: 'bg-purple-600 shadow-purple-600/30 text-white', permitir: ['admin'] },
        { id: 'usuarios', label: 'Usuarios', icon: Users, activeColor: 'bg-amber-600 shadow-amber-600/30 text-white', permitir: ['admin', 'coordinador'] },
    ].filter(item => item.permitir.includes(rol))

    const handleSelectVista = (id) => {
        setVistaActual(id)
        setMenuAbierto(false)
    }

    return (
        <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-300 bg-white/90 shadow-sm'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">

                {/* Logo e Identidad */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-600/25">
                        <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className={`text-lg font-extrabold tracking-wide ${darkMode ? 'text-white' : 'text-slate-900'}`}>RedTriage</h1>
                        <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sistema Inteligente de Derivación</p>
                    </div>
                </div>

                {/* Navegación Desktop (Oculta en móviles) */}
                <nav className={`hidden md:flex items-center gap-1 p-1.5 rounded-xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-200/70 border-slate-300'}`}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = vistaActual === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelectVista(item.id)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive ? `${item.activeColor} shadow-md` : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'}`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>

                {/* Controles de la derecha (Tema, Estado red, Botón hamburguesa y Sesión) */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'}`}
                    >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-200/60 border-slate-300'}`}>
                        <Radio className={`w-3.5 h-3.5 ${conectado ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                        <span className={conectado ? 'text-emerald-500' : 'text-slate-500'}>{conectado ? 'En Vivo' : 'Inactivo'}</span>
                    </div>

                    {usuario ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onLogout}
                                className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleSelectVista('login')}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Iniciar Sesión</span>
                        </button>
                    )}

                    {/* Botón de Menú Hamburguesa (Visible solo en pantallas medianas y pequeñas) */}
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className={`md:hidden p-2 rounded-xl border transition-all cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'}`}
                        aria-label="Abrir Menú"
                    >
                        {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Menú Desplegable Responsivo */}
            {menuAbierto && (
                <div className={`md:hidden border-t px-4 py-3 space-y-2 animate-fadeIn ${darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-700/40 text-xs sm:hidden">
                        <Radio className={`w-3.5 h-3.5 ${conectado ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                        <span className={conectado ? 'text-emerald-500 font-medium' : 'text-slate-500 font-medium'}>
                            Estado de Red: {conectado ? 'En Vivo' : 'Inactivo'}
                        </span>
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = vistaActual === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelectVista(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive ? `${item.activeColor} shadow-md` : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            )}
        </header>
    )
}