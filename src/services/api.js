import axios from 'axios'

const API = axios.create({
    // baseURL: 'http://localhost:4000/api',
    baseURL: 'https://sistema-derivacion-hospitalaria-back.onrender.com/api',
})

export default API