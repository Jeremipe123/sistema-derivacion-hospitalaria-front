import { EstadisticasSchema } from '../schemas/stats.schemas'

export const obtenerEstadisticas = async () => {
    const respuesta = await fetch('/api/stats')

    if (!respuesta.ok) {
        throw new Error('Error en la comunicación con el servidor.')
    }

    const datosRaw = await respuesta.json()

    // Zod valida el objeto en tiempo de ejecución sin requerir TypeScript
    return EstadisticasSchema.parse(datosRaw)
}