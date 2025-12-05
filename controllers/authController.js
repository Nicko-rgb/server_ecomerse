const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_en_produccion';

const authController = {
    register: async (req, res) => {
        
        try {
            const { email, password, firstName, lastName, phone } = req.body;
            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: 'Email inválido' });
            }
            if (password.length < 6) {
                return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });
            }
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, error: 'El email ya está registrado' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const created = await User.create({
                email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                phone: phone || '',
                role: 'customer',
                active: true
            });
            const DataUser = require('../models/DataUser');
            await DataUser.create({ user_id: created.id_user, addresses: [] });
            const token = jwt.sign({ id: created.id_user, email: created.email, role: created.role }, JWT_SECRET, { expiresIn: '7d' });
            const userWithoutPassword = {
                id: created.id_user,
                email: created.email,
                firstName: created.first_name,
                lastName: created.last_name,
                phone: created.phone,
                avatar: null,
                dateOfBirth: created.date_of_birth,
                gender: created.gender,
                role: created.role,
                active: created.active,
                addresses: [],
                paymentMethods: [],
                preferences: {},
                createdAt: created.registered_at,
                updatedAt: created.registered_at
            };
            res.status(201).json({ success: true, message: 'Usuario registrado correctamente', data: { user: userWithoutPassword, token } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al registrar usuario' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email y contraseña son obligatorios' });
            }
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
            }
            if (!user.active) {
                return res.status(401).json({ success: false, error: 'Usuario desactivado. Contacta al administrador' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
            }
            const token = jwt.sign({ id: user.id_user, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            const userWithoutPassword = {
                id: user.id_user,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatar: null,
                dateOfBirth: user.date_of_birth,
                gender: user.gender,
                role: user.role,
                active: user.active,
                addresses: [],
                paymentMethods: [],
                preferences: {},
                createdAt: user.registered_at,
                updatedAt: user.registered_at
            };
            res.json({ success: true, message: 'Login exitoso', data: { user: userWithoutPassword, token } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
        }
    },

    verifyToken: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
            const userWithoutPassword = {
                id: user.id_user,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatar: null,
                dateOfBirth: user.date_of_birth,
                gender: user.gender,
                role: user.role,
                active: user.active,
                addresses: [],
                paymentMethods: [],
                preferences: {},
                createdAt: user.registered_at,
                updatedAt: user.registered_at
            };
            res.json({ success: true, data: { user: userWithoutPassword } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al verificar token' });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, error: 'Contraseña actual y nueva son obligatorias' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' });
            }
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.update({ password: hashedPassword }, { where: { id_user: userId } });
            res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al cambiar contraseña' });
        }
    }
    ,
    googleLogin: async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ success: false, error: 'Falta idToken de Google' });
            }

            const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
            const resp = await fetch(verifyUrl);
            if (!resp.ok) {
                return res.status(401).json({ success: false, error: 'Token de Google inválido' });
            }
            const info = await resp.json();
            const email = info.email;
            const sub = info.sub; // Google user id
            const given_name = info.given_name || '';
            const family_name = info.family_name || '';
            if (!email || !sub) {
                return res.status(400).json({ success: false, error: 'Respuesta de Google incompleta' });
            }

            let user = await User.findOne({ where: { email } });
            if (!user) {
                const randomPass = await bcrypt.hash(`google_${sub}_${Date.now()}`, 10);
                user = await User.create({
                    email,
                    password: randomPass,
                    first_name: given_name,
                    last_name: family_name,
                    role: 'customer',
                    active: true,
                    provider: 'google',
                    provider_id: sub
                });
                const DataUser = require('../models/DataUser');
                await DataUser.create({ user_id: user.id_user, addresses: [] });
            } else {
                if (!user.provider || !user.provider_id) {
                    await User.update({ provider: 'google', provider_id: sub }, { where: { id_user: user.id_user } });
                }
            }

            const token = jwt.sign({ id: user.id_user, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            const userWithoutPassword = {
                id: user.id_user,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatar: null,
                dateOfBirth: user.date_of_birth,
                gender: user.gender,
                role: user.role,
                active: user.active,
                addresses: [],
                paymentMethods: [],
                preferences: {},
                createdAt: user.registered_at,
                updatedAt: user.registered_at
            };
            res.json({ success: true, message: 'Autenticación Google exitosa', data: { user: userWithoutPassword, token } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error en autenticación con Google' });
        }
    }
    ,
    checkEmail: async (req, res) => {
        console.log('Verificando email...');
        try {
            const { email } = req.body || {};
            if (!email) {
                return res.status(400).json({ success: false, error: 'Email es requerido' });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: 'Email inválido' });
            }
            const normalized = String(email).trim().toLowerCase();
            console.log('Email recibido:', normalized);
            const user = await User.findOne({ where: { email: normalized }, attributes: ['id_user'] });
            res.json({ success: true, data: { exists: !!user } });
        } catch (error) {
            console.error('Error checkEmail:', error && error.message ? error.message : error);
            res.status(500).json({ success: false, error: 'Error al verificar email' });
        }
    }
};

module.exports = authController;
