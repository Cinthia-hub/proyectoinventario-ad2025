import authService from '../services/auth.service.js';

export default {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await authService.login(username, password);
            res.json({ ok: true, ...result });
        } catch (error) {
            res.status(401).json({ ok: false, message: error.message });
        }
    },

    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({ ok: true, message: 'Usuario creado', result });
        } catch (error) {
            res.status(500).json({ ok: false, message: error.message });
        }
    }
};
