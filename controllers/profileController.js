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
                return res.status(404).json({ 
                    success: false, 
                    error: 'Usuario no encontrado' 
                });
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
                // Direcciones como array de objetos
                addresses: du ? [
                    {
                        id: 1,
                        type: 'home',
                        fullAddress: `${du.address}, ${du.city}, ${du.country}`,
                        reference: 'Dirección principal',
                        isPrimary: true,
                        createdAt: user.registered_at
                    }
                ] : [],
                paymentMethods: [],
                preferences: {},
                createdAt: user.registered_at,
                updatedAt: user.registered_at
            };
            
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
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
            
            const addresses = du ? [
                {
                    id: 1,
                    type: 'home',
                    fullAddress: `${du.address}, ${du.city}, ${du.country} ${du.postal_code}`,
                    reference: 'Dirección principal registrada',
                    isPrimary: true,
                    createdAt: new Date()
                }
            ] : [];
            
            res.json({ success: true, data: addresses });
        } catch (error) {
            console.error('Error getting addresses:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
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
            
            const paymentMethods = du && du.payment_methods ? du.payment_methods : [];
            
            res.json({ success: true, data: paymentMethods });
        } catch (error) {
            console.error('Error getting payment methods:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    },

    // Actualizar dirección
    updateAddress: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const addressId = parseInt(req.params.addressId);
            const updatedData = req.body;
            
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
            
            const list = Array.isArray(du.addresses) ? [...du.addresses] : [];
            const addressIndex = list.findIndex(addr => addr.id === addressId);
            
            if (addressIndex === -1) {
                return res.status(404).json({ success: false, error: 'Dirección no encontrada' });
            }
            
            // Si se marca como principal, desmarcar las demás
            if (updatedData.isPrimary) {
                for (const addr of list) addr.isPrimary = false;
            }
            
            // Actualizar la dirección
            list[addressIndex] = { ...list[addressIndex], ...updatedData };
            
            await DataUser.update({ addresses: list }, { where: { user_id: userId } });
            res.json({ success: true, message: 'Dirección actualizada correctamente', data: list[addressIndex] });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    },

    // Eliminar dirección
    deleteAddress: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const addressId = parseInt(req.params.addressId);
            
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
            
            const list = Array.isArray(du.addresses) ? [...du.addresses] : [];
            const filteredList = list.filter(addr => addr.id !== addressId);
            
            if (filteredList.length === list.length) {
                return res.status(404).json({ success: false, error: 'Dirección no encontrada' });
            }
            
            await DataUser.update({ addresses: filteredList }, { where: { user_id: userId } });
            res.json({ success: true, message: 'Dirección eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    },

    // Agregar método de pago
    addPaymentMethod: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const newPaymentMethod = req.body;
            
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) {
                du = await DataUser.create({ 
                    user_id: userId, 
                    addresses: [], 
                    payment_methods: [] 
                });
            }
            
            const paymentMethods = Array.isArray(du.payment_methods) ? [...du.payment_methods] : [];
            const nextId = paymentMethods.length ? Math.max(...paymentMethods.map(pm => pm.id || 0)) + 1 : 1;
            
            const paymentMethod = { 
                id: nextId, 
                ...newPaymentMethod,
                createdAt: new Date()
            };
            
            // Si es método principal, desmarcar los demás
            if (paymentMethod.isPrimary) {
                for (const pm of paymentMethods) pm.isPrimary = false;
            }
            
            paymentMethods.push(paymentMethod);
            
            await DataUser.update({ payment_methods: paymentMethods }, { where: { user_id: userId } });
            
            res.json({ 
                success: true, 
                message: 'Método de pago agregado correctamente', 
                data: paymentMethod 
            });
        } catch (error) {
            console.error('Error adding payment method:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    },

    // Actualizar método de pago
    updatePaymentMethod: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const paymentMethodId = parseInt(req.params.paymentMethodId);
            const updatedData = req.body;
            
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
            
            const paymentMethods = Array.isArray(du.payment_methods) ? [...du.payment_methods] : [];
            const methodIndex = paymentMethods.findIndex(pm => pm.id === paymentMethodId);
            
            if (methodIndex === -1) {
                return res.status(404).json({ success: false, error: 'Método de pago no encontrado' });
            }
            
            // Si se marca como principal, desmarcar los demás
            if (updatedData.isPrimary) {
                for (const pm of paymentMethods) pm.isPrimary = false;
            }
            
            // Actualizar el método de pago
            paymentMethods[methodIndex] = { ...paymentMethods[methodIndex], ...updatedData };
            
            await DataUser.update({ payment_methods: paymentMethods }, { where: { user_id: userId } });
            res.json({ 
                success: true, 
                message: 'Método de pago actualizado correctamente', 
                data: paymentMethods[methodIndex] 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    },

    // Eliminar método de pago
    deletePaymentMethod: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const paymentMethodId = parseInt(req.params.paymentMethodId);
            
            let du = await DataUser.findOne({ where: { user_id: userId } });
            if (!du) {
                return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }
            
            const paymentMethods = Array.isArray(du.payment_methods) ? [...du.payment_methods] : [];
            const filteredMethods = paymentMethods.filter(pm => pm.id !== paymentMethodId);
            
            if (filteredMethods.length === paymentMethods.length) {
                return res.status(404).json({ success: false, error: 'Método de pago no encontrado' });
            }
            
            await DataUser.update({ payment_methods: filteredMethods }, { where: { user_id: userId } });
            res.json({ success: true, message: 'Método de pago eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }
};

module.exports = profileController;
