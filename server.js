const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importar configuración de base de datos
const { sequelize, initAssociations, syncModels } = require('./models');
const { seedInitialData } = require('./config/seed');
const chalk = require('chalk');

app.get('/', (req, res) => {
    res.send('Ecommerce API Server');
});

// Ruta 404 para endpoints no encontrados
// app.use('*', (req, res) => {
//     res.status(404).json({
//         error: 'Endpoint no encontrado',
//         path: req.originalUrl,
//         method: req.method
//     });
// });

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log(chalk.bgBlue('✅ CONEXION A BASE DE DATOS EXITOSA'));
        initAssociations();
        await syncModels();
        console.log(chalk.bgGreen('✅ MODELO DE BASE DE DATOS SINCRONIZADOS'));
        
        // Importar y configurar rutas después de inicializar la DB
        const authRoutes = require('./routes/authRoutes');
        const profileRoutes = require('./routes/profileRoutes');
        const adminRoutes = require('./routes/adminRoutes');
        const productsRoutes = require('./routes/productsRoutes');
        
        // Usar rutas
        app.use('/api', authRoutes); // Rutas de autenticación (públicas)
        app.use('/api', productsRoutes); // Rutas de productos (públicas)
        app.use('/api', profileRoutes); // Rutas de perfil (protegidas)
        app.use('/api/orders', require('./routes/ordersRoutes')); // Rutas de pedidos (protegidas)
        app.use('/api', adminRoutes); // Rutas de admin (protegidas)
        console.log(chalk.bgGreen('✅ RUTAS CONFIGURADAS'));
        if (process.env.SEED_INITIAL_DATA === 'true') {
            await seedInitialData();
            console.log(chalk.bgGreen('✅ DATOS INICIALES SEMBRADOS'));
            
            // Ejecutar seeder de datos de perfil si está habilitado
            if (process.env.SEED_PROFILE_DATA === 'true') {
                const { seedProfileData } = require('./scripts/seedProfileDataPostgres');
                await seedProfileData();
                console.log(chalk.bgGreen('✅ DATOS DE PERFIL SEMBRADOS'));
            }
        }
        app.listen(port, '0.0.0.0', () => {
            console.log(chalk.green(`✅ Servidor en funcionamiento: http://localhost:${port}`));
            console.log(chalk.green(`🌐 Status: http://localhost:${port}/health`));
        });
    } catch (err) {
        console.error(chalk.bgRed('❌ Error al iniciar el servidor'), err);
        process.exit(1);
    }
};

start();
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ status: 'ok', db: 'up', time: new Date().toISOString(), uptime: process.uptime() });
    } catch (e) {
        res.status(500).json({ status: 'error', db: 'down', error: e.message });
    }
});
