import userRepository from '../repositories/user.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

export default {
    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Contraseña incorrecta');
        }

        // Usamos role || rol para compatibilidad con tu modelo (frontend usa 'rol')
        const roleValue = user.role || user.rol;

        const token = jwt.sign(
            { id: user.id, username: user.username, role: roleValue },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        const { password: _, ...userWithoutPass } = user;
        return { user: userWithoutPass, token };
    },

    async register(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await userRepository.create({
            ...data,
            password: hashedPassword
        });
        return newUser;
    }
};