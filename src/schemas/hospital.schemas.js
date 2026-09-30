import { z } from 'zod'

export const hospitalSchema = z.object({
    nombre: z.string().trim()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(80, 'El nombre es demasiado largo'),
    nivel: z.enum(['Nivel I', 'Nivel II', 'Nivel III', 'Nivel IV'], {
        errorMap: () => ({ message: 'Seleccione un nivel válido' })
    }),
    direccion: z.string().trim()
        .min(5, 'Dirección muy corta')
        .max(150, 'Dirección muy larga'),
    latitud: z.number({ invalid_type_error: 'Latitud requerida' })
        .min(-90, 'Latitud mínima es -90')
        .max(90, 'Latitud máxima es 90'),
    longitud: z.number({ invalid_type_error: 'Longitud requerida' })
        .min(-180, 'Longitud mínima es -180')
        .max(180, 'Longitud máxima es 180'),
    camas_uci_totales: z.number({ invalid_type_error: 'Ingrese un número' })
        .int().min(0, 'No puede ser negativo').max(500, 'Máximo 500 camas UCI'),
    camas_uci_libres: z.number({ invalid_type_error: 'Ingrese un número' })
        .int().min(0, 'No puede ser negativo'),
    camas_urgencia_totales: z.number({ invalid_type_error: 'Ingrese un número' })
        .int().min(0, 'No puede ser negativo').max(1000, 'Máximo 1000 camas urgencia'),
    camas_urgencia_libres: z.number({ invalid_type_error: 'Ingrese un número' })
        .int().min(0, 'No puede ser negativo'),
    estado_operativo: z.enum(['DISPONIBLE', 'SATURADO', 'COLAPSADO', 'INACTIVO'])
})
    .refine((data) => data.camas_uci_libres <= data.camas_uci_totales, {
        message: 'Camas UCI libres no pueden superar a las totales',
        path: ['camas_uci_libres']
    })
    .refine((data) => data.camas_urgencia_libres <= data.camas_urgencia_totales, {
        message: 'Camas de urgencia libres no pueden superar a las totales',
        path: ['camas_urgencia_libres']
    })