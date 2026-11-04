import { io } from 'socket.io-client'

export const socket = io('http://localhost:4000', {
    // export const socket = io('https://sistema-derivacion-hospitalaria-back.onrender.com/api', {
    autoConnect: true,
})