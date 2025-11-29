import axios from "axios";

// Aquí creamos una instancia de axios con la configuración base
const instance = axios.create({
  // IMPORTANTE: Cambia el puerto '3000' si tu backend corre en otro (ej: 4000, 5000, 8080)
  baseURL: "http://localhost:3000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;