const User = require('../models/User');
const DataUser = require('../models/DataUser');
const PaymentMethod = require('../models/PaymentMethod');

const profileController = {
    // Obtener perfil del usuario
    getProfile: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const du = await DataUser.findOne({ where: { user_id: userId } });
            const data = {
                id: user.id_user,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                avatar: null,
                dateOfBirth: user.date_of_birth,
                gender: user.gender,
                addresses: du ? du.addresses : [],
                paymentMethods: [],
                preferences: {},
                createdAt: user.registered_at,
                updatedAt: user.registered_at
            };
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Actualizar perfil del usuario
    updateProfile: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const updates = req.body;
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            await User.update({ first_name: updates.firstName, last_name: updates.lastName, phone: updates.phone, date_of_birth: updates.dateOfBirth, gender: updates.gender }, { where: { id_user: userId } });
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) du = await DataUser.create({ user_id: userId, addresses: [] });
            const duUpdates = { address: updates.address, city: updates.city, postal_code: updates.postalCode, country: updates.country };
            if (updates && updates.preferredPaymentMethodId) {
                duUpdates.preferred_payment_method_id = updates.preferredPaymentMethodId;
            }
            await DataUser.update(duUpdates, { where: { user_id: userId } });
            const updated = await User.findByPk(userId);
            const updatedDU = await DataUser.findOne({ where: { user_id: userId } });
            res.json({ success: true, message: 'Perfil actualizado correctamente', data: { id: updated.id_user, email: updated.email, firstName: updated.first_name, lastName: updated.last_name, phone: updated.phone, avatar: null, dateOfBirth: updated.date_of_birth, gender: updated.gender, addresses: updatedDU.addresses || [], address: updatedDU.address, city: updatedDU.city, postalCode: updatedDU.postal_code, country: updatedDU.country, paymentMethod: updatedDU.payment_method, paymentMethods: [], preferences: {}, createdAt: updated.registered_at, updatedAt: updated.registered_at } });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Obtener direcciones del usuario
    getAddresses: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const du = await DataUser.findOne({ where: { user_id: userId } });
            res.json({ success: true, data: du ? du.addresses : [] });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Agregar nueva dirección
    addAddress: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const newAddress = req.body;
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) {
                du = await DataUser.create({ user_id: userId, addresses: [] });
            }
            const list = Array.isArray(du.addresses) ? [...du.addresses] : [];
            const nextId = list.length ? Math.max(...list.map(a => a.id || 0)) + 1 : 1;
            const addr = { id: nextId, ...newAddress };
            if (addr.isPrimary) {
                for (const a of list) a.isPrimary = false;
            }
            list.push(addr);
            await DataUser.update({ addresses: list }, { where: { user_id: userId } });
            res.json({ success: true, message: 'Dirección agregada correctamente', data: addr });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Obtener métodos de pago
    getPaymentMethods: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const du = await DataUser.findOne({ where: { user_id: userId } });
            const preferredId = du ? du.preferred_payment_method_id : null;
            const catalog = await PaymentMethod.findAll({ where: { is_active: true } });
            const data = catalog.map(pm => ({ id: pm.id_payment_method, code: pm.code, name: pm.name, isPrimary: pm.id_payment_method === preferredId }));
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    // Agregar método de pago
    addPaymentMethod: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const { paymentMethodId } = req.body;
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) du = await DataUser.create({ user_id: userId, addresses: [] });
            await DataUser.update({ preferred_payment_method_id: paymentMethodId }, { where: { user_id: userId } });
            const catalog = await PaymentMethod.findAll({ where: { is_active: true } });
            const data = catalog.map(pm => ({ id: pm.id_payment_method, code: pm.code, name: pm.name, isPrimary: pm.id_payment_method === paymentMethodId }));
            res.json({ success: true, message: 'Preferencia de método de pago actualizada', data });
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = profileController;
