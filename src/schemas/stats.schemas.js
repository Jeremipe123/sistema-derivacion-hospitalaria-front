import { z } from 'zod'

export const EstadisticasSchema = z.discriminatedUnion('sinRegistros', [
    z.object({
        sinRegistros: z.literal(true),
    }),
    z.object({
        sinRegistros: z.literal(false),
        resumenGeneral: z.object({
            totalPacientesHistorico: z.number(),
            totalPacientesEsteMes: z.number(),
            tasaEfectividad: z.number(),
        }),
        distribucionTriage: z.object({
            rojo: z.number(),
            amarillo: z.number(),
            verde: z.number(),
        }),
        estadosPacientes: z.object({
            derivados: z.number(),
            atendidos: z.number(),
            enTransito: z.number(),
        }),
        capacidadRed: z.object({
            totalHospitales: z.number(),
            uci: z.object({
                totales: z.number(),
                libres: z.number(),
                porcentajeOcupacion: z.number(),
            }),
            urgencias: z.object({
                totales: z.number(),
                libres: z.number(),
                porcentajeOcupacion: z.number(),
            }),
        }),
        eficienciaSistema: z.object({
            tiempoPromedioTrasladoMin: z.number(),
            distanciaPromediaKm: z.number(),
        }),
    }),
])