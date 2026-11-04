export function Footer({ darkMode }) {
    return (
        <footer className={`border-t py-4 px-4 text-center text-xs transition-colors duration-300 ${darkMode ? 'border-slate-800/80 bg-slate-900/60 text-slate-400' : 'border-slate-300 bg-white/80 text-slate-600 shadow-inner'
            }`}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>© {new Date().getFullYear()} RedTriage. Todos los derechos reservados.</p>
                <p className="font-medium">Sistema Inteligente de Derivación Hospitalaria</p>
            </div>
        </footer>
    )
}