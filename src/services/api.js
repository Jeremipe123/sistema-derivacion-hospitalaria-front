import axios from 'axios'

const API = axios.create({
    baseURL: 'https://sistema-derivacion-hospitalaria-back.onrender.com/api',
})

export default API