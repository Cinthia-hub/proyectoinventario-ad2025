import userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Usa una variable de entorno o una cadena secreta fija por ahora
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

export default {
    async login(username, password) {
        // 1. Buscar usuario
        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // 2. Verificar password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        // 3. Generar Token (incluimos el rol y el id)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Retornamos usuario (sin pass) y token
        const { password: _, ...userWithoutPass } = user;
        return { user: userWithoutPass, token };
    },

    async register(data) {
        // Encriptar contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await userRepository.create({
            ...data,
            password: hashedPassword
        });
        return newUser;
    }
};
