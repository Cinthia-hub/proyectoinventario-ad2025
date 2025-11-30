import axios from "axios";

// Aquí creamos una instancia de axios con la configuración base
const instance = axios.create({
  baseURL: "http://localhost:3000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;