import { useState } from 'react'
import API from '../services/api'
import { Activity, Lock, User, AlertCircle } from 'lucide-react'

export function Login({ onLoginSuccess, darkMode }) {
    const [usuario, setUsuario] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setCargando(true)
        setError('')

        try {
            const response = await API.post('/auth/login', { usuario, password })
            const userData = response.data

            // Guardar sesión en LocalStorage
            localStorage.setItem('redtriage_user', JSON.stringify(userData))
            onLoginSuccess(userData)
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión en el servidor.')
        } finally {
            setCargando(false)
        }
    }

    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-xl'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const inputBg = darkMode ? 'bg-slate-800/80 border-slate-700/80 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'

    return (
        <div className="max-w-md mx-auto my-12 px-4">
            <div className={`${cardBg} border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6`}>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-600/30 mb-2">
                        <Activity className="w-8 h-8 animate-pulse" />
                    </div>
                    <h2 className={`text-2xl font-extrabold tracking-tight ${textColor}`}>Iniciar Sesión</h2>
                    <p className={`text-xs ${subTextColor}`}>Sistema Inteligente de Derivación RedTriage</p>
                </div>

                {error && (
                    <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div>
                        <label className={`block font-semibold mb-1.5 ${textColor}`}>Usuario</label>
                        <div className="relative">
                            <User className={`w-4 h-4 absolute left-3.5 top-3.5 ${subTextColor}`} />
                            <input
                                type="text"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-rose-500 ${inputBg}`}
                                placeholder="Usuario de red"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block font-semibold mb-1.5 ${textColor}`}>Contraseña</label>
                        <div className="relative">
                            <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 ${subTextColor}`} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-rose-500 ${inputBg}`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                        <input
                            type="checkbox"
                            checked={true}
                            disabled
                            className="w-4 h-4 accent-rose-600 rounded cursor-not-allowed opacity-80"
                        />
                        <span className={`text-xs ${subTextColor}`}>
                            Acepto los términos de servicio, privacidad y normativas de seguridad hospitalaria.
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                    >
                        {cargando ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
                    </button>
                </form>
            </div>
        </div>
    )
}