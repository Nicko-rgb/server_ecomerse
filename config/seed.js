const sequelize = require('../config/db');
const Product = require('../models/Product');
const Categories = require('../models/Categories');
const Country = require('../models/Country');
const PaymentMethod = require('../models/PaymentMethod');
const User = require('../models/User');
const chalk = require('chalk');
const ProductFeature = require('../models/ProductFeature');

async function seedInitialData() {
    const shouldSeed = String(process.env.SEED_INITIAL_DATA || '').toLowerCase() === 'true';
    if (!shouldSeed) {
        console.log(chalk.yellow('Seed skipped: SEED_INITIAL_DATA=false'));
        return;
    }
    try {
        const existingProducts = await Product.count();
        if (existingProducts > 0) {
            console.log(chalk.yellow('Seed skipped: products already exist'));
            return;
        }
        console.log(chalk.blue('Seeding initial data...'));

        const names = ['Electrónica', 'Ropa', 'Calzado', 'Accesorios'];
        const catRows = await Categories.bulkCreate(names.map(name => ({ name })), { returning: true });
        const catMap = new Map(catRows.map(c => [c.name, c.id_category]));

        const items = [
            {
                name: 'Camiseta Básica',
                description: 'Camiseta de algodón 100% de alta calidad, confeccionada con fibras suaves y transpirables que garantizan comodidad durante todo el día. Ideal para uso casual, actividades diarias o para combinar con cualquier estilo. Su material resistente mantiene el color y la forma incluso después de múltiples lavados.',
                price: 29.99,
                old_price: 39.99,
                category_id: catMap.get('Ropa'),
                stock: 50,
                images: [
                    'https://www.shutterstock.com/image-photo/plain-white-tshirt-on-wooden-260nw-2553110039.jpg',
                    'https://img.freepik.com/vector-gratis/ilustracion-contorno-camiseta-dibujada-mano_23-2150927674.jpg?semt=ais_hybrid&w=740&q=80',
                    'https://http2.mlstatic.com/D_NQ_NP_642193-MLB78585671464_082024-O-camiseta-masculina-basica-gola-redonda-100-poliester.webp',
                    'https://jaspeoriginal.es/cdn/shop/files/Camiseta_Basica_Blanca_2.jpg?v=1728372967&width=1445'
                ],
                active: true,
                is_featured: true
            },
            {
                name: 'Jeans Slim Fit',
                description: 'Jeans ajustados estilo Slim Fit fabricados con mezclilla premium que ofrece elasticidad y durabilidad. Diseñados para adaptarse cómodamente al cuerpo sin restringir el movimiento. Perfectos para uso diario, salidas casuales o combinarlos con prendas formales. Su textura suave y su corte moderno proporcionan un look estilizado.',
                price: 59.99,
                old_price: 79.99,
                category_id: catMap.get('Ropa'),
                stock: 30,
                images: [
                    'https://www.zevadenim.com/wp-content/uploads/2024/06/Diferencias-entre-jeans-slim-fit-y-straight-fit-Guia-completa-para-elegir-el-ajuste-perfecto.webp',
                    'https://mbo.com.pe/cdn/shop/files/Mbo_Ecommerce_19Abr0713_d8132f2f-d092-4832-8bf9-72b556da6860.png?v=1756154710&width=1080',
                    'https://pieers.com/media/catalog/product/cache/1f196d9bd42af3448cca86c23fe7b55a/p/p/ppr0b7t3az1_1_1.jpg',
                    'https://app.cuidadoconelperro.com.mx/media/catalog/product/1/_/1_9117.jpg?optimize=medium&fit=bounds&height=&width=&width=360&quality=75'
                ],
                active: true,
                is_featured: true
            },
            {
                name: 'Zapatillas Deportivas',
                description: 'Zapatillas deportivas ligeras y cómodas, ideales para running, gimnasio o caminatas largas. Incorporan una suela antideslizante y amortiguada que reduce el impacto en cada paso, proporcionando estabilidad y soporte. Su tejido transpirable mantiene los pies frescos y secos durante la actividad física.',
                price: 89.99,
                old_price: 119.99,
                category_id: catMap.get('Calzado'),
                stock: 20,
                images: [
                    'https://img.bestdealplus.com/ae04/kf/Hfde975b8c287443597a0423403f02f10E.jpg',
                    'https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/e5dddbebf418f453c4aa298cc4c20d96.jpg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp',
                    'https://img.kwcdn.com/product/fancy/c9be4dc1-42ce-423f-bc8c-5cebc8889ba3.jpg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp',
                    'https://img.bestdealplus.com/ae04/kf/H11e4ec34256c472b9cce112ce152f048g.jpg'
                ],
                active: true
            },
            {
                name: 'Chaqueta de Cuero',
                description: 'Chaqueta de cuero sintético de alta calidad, con acabado suave y diseño moderno inspirado en la moda urbana. Perfecta para clima frío o salidas nocturnas, ofreciendo elegancia y protección. Incluye forro interno acolchado y cierres metálicos resistentes que aportan estilo y durabilidad.',
                price: 129.99,
                old_price: 199.99,
                category_id: catMap.get('Ropa'),
                stock: 15,
                images: [
                    'https://plazavea.vteximg.com.br/arquivos/ids/29814546-450-450/image-0.jpg?v=638654780327270000',
                    'https://m.media-amazon.com/images/I/91JFZBDAZxL._AC_SL1500_.jpg',
                    'https://m.media-amazon.com/images/I/81qv2JL7AgL._AC_SL1500_.jpg',
                    'https://m.media-amazon.com/images/I/51arA3BwynL._AC_.jpg'
                ],
                active: true
            },
            {
                name: 'Reloj Inteligente',
                description: 'Smartwatch multifuncional equipado con monitor de frecuencia cardíaca, GPS integrado y notificaciones inteligentes. Ideal para deportistas o quienes desean controlar su salud diaria. Incluye modos de ejercicio, seguimiento del sueño, resistencia al agua y batería de larga duración. Compatible con Android e iOS.',
                price: 199.99,
                old_price: 299.99,
                category_id: catMap.get('Electrónica'),
                stock: 25,
                images: [
                    'https://m.media-amazon.com/images/I/7161CULzh+L._AC_SL1500_.jpg',
                    'https://acdn-us.mitiendanube.com/stores/001/015/175/products/smartwatch_d20_1-47dbd728ec08f97af217320319112793-1024-1024.jpeg',
                    'https://harugroup.com.co/cdn/shop/files/G-Tide_Q1_Negro_-_3_800x.png?v=1745611026',
                    'https://i.blogs.es/025be6/oneplus-watch-13-/650_1200.jpg'
                ],
                active: true,
                is_featured: true
            },
            {
                name: 'Mochila Deportiva',
                description: 'Mochila deportiva resistente al agua, elaborada con materiales duraderos y pensada para acompañarte en entrenamientos, viajes o uso diario. Cuenta con múltiples compartimentos para organizar objetos personales, ropa o accesorios. Sus tirantes acolchados brindan comodidad incluso en trayectos largos.',
                price: 45.99,
                old_price: 59.99,
                category_id: catMap.get('Accesorios'),
                stock: 40,
                images: [
                    'https://media2.solodeportes.com.ar/media/catalog/product/cache/7c4f9b393f0b8cb75f2b74fe5e9e52aa/m/o/mochila-adidas-sport-negra-100030it2121001-1.jpg',
                    'https://fitnessmarket.mx/cdn/shop/files/Capturadepantalla2025-05-31125601_1024x1024@2x.jpg?v=1748717857',
                    'https://m.media-amazon.com/images/I/71vCbBKQgBL._AC_UY1000_.jpg',
                    'https://m.media-amazon.com/images/I/61G6lkjUzPL._AC_UY1000_.jpg'
                ],
                active: true
            },
            {
                name: 'Auriculares Bluetooth',
                description: 'Auriculares inalámbricos con tecnología Bluetooth de última generación, diseñados para ofrecer una experiencia de sonido envolvente y clara. Incorporan cancelación de ruido para mayor concentración, batería de larga duración y controles táctiles. Ideales para música, llamadas o entrenamiento.',
                price: 79.99,
                old_price: 99.99,
                category_id: catMap.get('Electrónica'),
                stock: 35,
                images: [
                    'https://neodigitalperu.com/cdn/shop/files/ImagenaudifonB391.jpg?v=1701545758',
                    'https://marroba.com/cdn/shop/files/2b2a4d0c-e770-4c1f-b644-2bf08f0ec3df.8c1456fcab2810d3ff428354fe90d08a.webp?v=1732111969&width=1946',
                    'https://img.joomcdn.net/efff7c9adf6778e4f9b2b68184b5a04ec4224b2e_1024_1024.jpeg',
                    'https://i.ebayimg.com/00/s/ODAwWDgwMA==/z/-gwAAOSw1PJmGYhY/$_12.JPG?set_id=880000500F',
                ],
                active: true
            },
            {
                name: 'Gorra Deportiva',
                description: 'Gorra deportiva ajustable fabricada con materiales ligeros y transpirables. Diseñada para ofrecer protección UV contra los rayos solares, ideal para actividades al aire libre como correr, caminar o entrenar. Su diseño moderno se adapta a cualquier estilo y proporciona un ajuste cómodo.',
                price: 19.99,
                old_price: 24.99,
                category_id: catMap.get('Accesorios'),
                stock: 60,
                images: [
                    'https://img.kwcdn.com/product/open/86b9080c38a84a4f8d9c20af07571f78-goods.jpeg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp',
                    'https://pgamexico.com.mx/cdn/shop/products/legacy91w.jpg?v=1626297450&width=1445',
                    'https://www.pletorastore.com/cdn/shop/files/fv5522-100-a.jpg?v=1710024151&width=1000',
                    'https://d3fvqmu2193zmz.cloudfront.net/items_2/uid_commerces.1/uid_items_2.2025082120153856769/1500x1500/68A89484542B2-Gorra-Deportiva-Unisex-Training-Bb-Cap.webp'
                ],
                active: true
            },
            {
                name: 'Polo Deportivo Madrid',
                description: 'Polo ligero y transpirable confeccionado con fibras técnicas que favorecen la circulación del aire y reducen la acumulación de humedad. Su tejido elástico acompaña el movimiento en ejercicios de alta intensidad y uso diario. Costuras reforzadas y acabado suave que conserva la forma y color tras múltiples lavados.',
                price: 24.99,
                old_price: 34.99,
                category_id: catMap.get('Ropa'),
                stock: 80,
                images: [
                    'https://home.ripley.com.pe/Attachment/WOP_5/2072282279298/2072282279298_2.jpg',
                    'https://djheal.com/wp-content/uploads/2023/10/CAMISETA-DEPORTIVA-REAL-MADRID-2023-scaled.jpeg',
                    'https://londonpraze.tiendada.com/api/scrooge/file/FL-43533B3A?v=-1',
                    'https://assets.adidas.com/images/w_600,f_auto,q_auto/d3c03a0b20cb42b0befdceab6c7ed8f0_9366/Polo_UBP_Real_Madrid_Blanco_JF2591_HM1.jpg'

                ],
                active: true
            },
            {
                name: 'Auriculares Gaming',
                description: 'Auriculares con sonido envolvente y drivers de alta fidelidad que destacan detalles en música y juegos. Micrófono plegable con cancelación de ruido para comunicación clara en streaming y partidas online. Diadema ajustable y almohadillas suaves que permiten sesiones largas sin fatiga.',
                price: 99.99,
                old_price: 129.99,
                category_id: catMap.get('Electrónica'),
                stock: 45,
                images: [
                    'https://www.lacuracao.pe/media/catalog/product/g/h/gh-711_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700',
                    'https://media.falabella.com/falabellaPE/126620257_01/w=800,h=800,fit=pad',
                    'https://ss637.liverpool.com.mx/xl/1146321026.jpg',
                    'https://i.blogs.es/3d1180/blackshark1/1366_2000.jpeg'
                ],
                active: true,
                is_featured: true
            },
            {
                name: 'Mouse Inalámbrico',
                description: 'Mouse ergonómico con conexión inalámbrica estable y sensor de alta precisión para tareas de oficina y diseño. Su batería de larga duración y formato ligero permiten un uso continuo sin interrupciones. Superficie agradable al tacto y botones silenciosos para mayor confort.',
                price: 24.99,
                old_price: 34.99,
                category_id: catMap.get('Electrónica'),
                stock: 100,
                images: [
                    'https://promart.vteximg.com.br/arquivos/ids/7806739-700-700/image-e8b843d525644fdcbdb5f6deb5a20fe1.jpg?v=638418290046730000',
                    'https://down-id.img.susercontent.com/file/id-11134207-7r991-lto0e4un0t51ba',
                    'https://http2.mlstatic.com/D_NQ_NP_814823-MLA95682601868_102025-O.webp',
                    'https://dojiw2m9tvv09.cloudfront.net/32752/product/acccom8493-28156.jpg'
                ],
                active: true
            },
            {
                name: 'Cargador Rápido USB-C',
                description: 'Cargador compacto con tecnología de carga rápida compatible con estándares modernos USB-C. Ofrece protección contra sobrecarga y control de temperatura para mayor seguridad. Ideal para smartphones, tablets y dispositivos portátiles, con diseño ligero y robusto.',
                price: 19.99,
                old_price: 24.99,
                category_id: catMap.get('Electrónica'),
                stock: 120,
                images: [
                    'https://m.media-amazon.com/images/I/51hejkg9PhL._AC_SL1500_.jpg',
                    'https://oechsle.vteximg.com.br/arquivos/ids/13934706-1000-1000/image-9493a26e666a4c9391fbf307b306283f.jpg?v=638132425169530000',
                    'https://plazavea.vteximg.com.br/arquivos/ids/29161513-418-418/imageUrl_1.jpg',
                    'https://m.media-amazon.com/images/I/51m8SQn9tCL.jpg'

                ],
                active: true
            },
            {
                name: 'Gafas de Sol',
                description: 'Gafas de sol con protección UV de alta eficiencia que reducen el deslumbramiento y cuidan la visión en exteriores. Montura ligera y resistente pensada para uso prolongado sin incomodidad. Diseño versátil que combina con estilos urbanos y actividades al aire libre.',
                price: 29.99,
                old_price: 39.99,
                category_id: catMap.get('Accesorios'),
                stock: 70,
                images: [
                    'https://www.visioncenter.com.pe/cdn/shop/products/8719154834103_1_1800x1800.jpg?v=1690784342',
                    'https://eu-images.contentstack.com/v3/assets/blt7dcd2cfbc90d45de/bltca0defe0e9c1b630/67b844be273493d43a833ed1/28513-1.jpg?format=pjpg&auto=webp&quality=75%2C90&width=3840',
                    'https://zippo.co.za/cdn/shop/files/1OB36-03.png?v=1697700018',
                    'https://carbonestore.com/cdn/shop/files/12_WYZ1K01_800x.jpg?v=1705441196'
                ],
                active: true
            },
            {
                name: 'Laptop Asus Zenbook Duo',
                description: 'Ultrabook de alto rendimiento con doble pantalla táctil que optimiza la productividad y el flujo de trabajo creativo. Construida en chasis ligero de aleación, integra procesador de última generación, almacenamiento SSD veloz y gráficos avanzados. Sistema de refrigeración silencioso, batería de larga duración y conectividad completa (Wi‑Fi 6, Bluetooth, puertos USB‑C/HDMI). Ideal para diseño, programación y multitarea intensiva.',
                price: 1899.99,
                old_price: 2199.99,
                category_id: catMap.get('Electrónica'),
                stock: 12,
                images: [
                    'https://www.asus.com/media/global/gallery/auehosmph3rxub0i_setting_xxx_0_90_end_2000.png',
                    'https://brain-images-ssl.cdn.dixons.com/4/7/10208474/l_10208474.jpg',
                    'https://www.asus.com/media/global/gallery/zqsq5uuglbcfkugl_setting_xxx_0_90_end_2000.png',
                    'https://www.acomputerservice.com.pe/4018/laptop-asus-zenbook-pro-duo-15-ux582lr-156-uhd-4k-tactil-i9-10980hk-24ghz-32gb-ssd-1tb-nvidia-rtx-3070-8gb.jpg'
                ],
                active: true
            },
            {
                name: 'Televisor 55" 4K UHD Smart',
                description: 'Televisor de 55 pulgadas con panel 4K UHD y soporte HDR para colores vivos y alto contraste. Plataforma Smart TV con acceso a aplicaciones de streaming, asistente por voz y modo juego de baja latencia. Incluye altavoces con sonido envolvente, múltiples puertos HDMI/USB y control remoto ergonómico. Perfecto para cine en casa y consolas.',
                price: 699.99,
                old_price: 899.99,
                category_id: catMap.get('Electrónica'),
                stock: 18,
                images: [
                    'https://oechsle.vtexassets.com/arquivos/ids/19640890/imageUrl_1.jpg?v=638665828508070000',
                    'https://media.falabella.com/falabellaPE/137120990_03/w=800,h=800,fit=pad',
                    'https://http2.mlstatic.com/D_NQ_NP_722639-MLU79005713441_092024-O.webp',
                    'https://home.ripley.com.pe/Attachment/WOP_5/2018295640236/2018295640236_2.jpg'
                ],
                active: true
            },
            {
                name: 'Celular iPhone 15',
                description: 'Smartphone de gama alta con chip de alto desempeño, conectividad 5G y cámaras avanzadas para foto y video en condiciones de baja luz. Pantalla brillante con alta tasa de actualización, batería optimizada y resistencia al agua. Ecosistema iOS con seguridad integrada y compatibilidad con accesorios inalámbricos.',
                price: 999.99,
                old_price: 1099.99,
                category_id: catMap.get('Electrónica'),
                stock: 25,
                images: [
                    'https://triplex.com.bo/wp-content/uploads/2024/01/15-pro-max.jpg',
                    'https://imgs.casasbahia.com.br/1576811356/1xg.jpg',
                    'https://assets.thehansindia.com/h-upload/2023/09/04/1377571-iphone.webp',
                    'https://walmartcr.vtexassets.com/arquivos/ids/551477/Celular-Apple-Iphone-15-pro-max-256GB-1-99239.jpg?v=638445373846970000'
                ],
                active: true
            },
            {
                name: 'Refrigerador No Frost 400L',
                description: 'Refrigerador de 400 litros con tecnología No Frost que evita la formación de hielo y mantiene una temperatura uniforme. Motor inverter eficiente y silencioso, compartimentos ajustables, control de humedad para frutas y verduras y modo ahorro de energía. Acabado en acero y fácil limpieza.',
                price: 849.99,
                old_price: 999.99,
                category_id: catMap.get('Electrónica'),
                stock: 10,
                images: [
                    'https://home.ripley.com.pe/Attachment/WOP_5/2003211583124/2003211583124-1.jpg',
                    'https://plazavea.vteximg.com.br/arquivos/ids/6884824-1000-1000/20195116.jpg?v=637807970974630000',
                    'https://hiraoka.com.pe/media/catalog/product/1/1/113846_5_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=560&width=700&canvas=700:560',
                    'https://home.ripley.com.pe/Attachment/WOP_5/2003211583124/2003211583124-3.jpg'
                ],
                active: true
            },
            {
                name: 'iPad Pro 12.9"',
                description: 'Tablet profesional con pantalla de alta frecuencia y brillo uniforme, procesador de última generación para edición, diseño y multitarea. Compatible con lápiz y teclado magnético, sonido estéreo y autonomía prolongada. Conectividad Wi‑Fi 6, USB‑C y ecosistema de aplicaciones optimizadas.',
                price: 1199.99,
                old_price: 1399.99,
                category_id: catMap.get('Electrónica'),
                stock: 20,
                images: [
                    'https://www.efe.com.pe/media/catalog/product/o/r/orig_whatsapp-image-2025-05-12-at-34015-pm_508593.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700',
                    'https://home.ripley.com.pe/Attachment/WOP_5/2004320101414/2004320101414-6.jpg',
                    'https://m.media-amazon.com/images/I/616JMP66dfL._AC_UF350,350_QL80_.jpg',
                    'https://m.media-amazon.com/images/I/61l+etQ2jnL.jpg'  
                ],
                active: true
            },
        ];
        const created = await Product.bulkCreate(items, { returning: true });
        console.log(chalk.green('Seed completed: products and categories inserted'));

        console.log(chalk.blue('Seeding product features...'));
        for (const p of created) {
            const catId = p.category_id;
            const base = [];
            if (catId === catMap.get('Ropa')) {
                base.push({ name: 'Material', value: 'Algodón' });
                base.push({ name: 'Talla', value: 'M' });
                base.push({ name: 'Color', value: 'Negro' });
            } else if (catId === catMap.get('Calzado')) {
                base.push({ name: 'Tipo', value: 'Running' });
                base.push({ name: 'Talla', value: '42' });
                base.push({ name: 'Suela', value: 'Antideslizante' });
            } else if (catId === catMap.get('Electrónica')) {
                base.push({ name: 'Marca', value: 'Genérica' });
                base.push({ name: 'Garantía', value: '12 meses' });
                base.push({ name: 'Peso', value: '0.5 kg' });
            } else if (catId === catMap.get('Accesorios')) {
                base.push({ name: 'Material', value: 'Poliéster' });
                base.push({ name: 'Color', value: 'Azul' });
                base.push({ name: 'Resistente al agua', value: 'Sí' });
            }
            if (base.length) {
                await ProductFeature.bulkCreate(base.map(b => ({ product_id: p.id_product, name: b.name, value: b.value })));
            }
        }
        console.log(chalk.green('Seed completed: product features inserted'));

        const countriesCount = await Country.count();
        if (countriesCount === 0) {
            console.log(chalk.blue('Seeding countries...'));
            await Country.bulkCreate([
                { code: 'US', name: 'United States', currency_code: 'USD', currency_name: 'US Dollar', currency_symbol: '$' },
                { code: 'ES', name: 'España', currency_code: 'EUR', currency_name: 'Euro', currency_symbol: '€' },
                { code: 'MX', name: 'México', currency_code: 'MXN', currency_name: 'Peso Mexicano', currency_symbol: '$' },
                { code: 'PE', name: 'Perú', currency_code: 'PEN', currency_name: 'Sol', currency_symbol: 'S/' },
            ]);
            console.log(chalk.green('Seed completed: countries inserted'));
        } else {
            console.log(chalk.yellow('Seed skipped: countries already exist'));
        }

        const pmCount = await PaymentMethod.count();
        if (pmCount === 0) {
            console.log(chalk.blue('Seeding payment methods catalog...'));
            await PaymentMethod.bulkCreate([
                { code: 'card', name: 'Tarjeta' },
                { code: 'paypal', name: 'PayPal' },
                { code: 'yape', name: 'Yape' },
                { code: 'plin', name: 'Plin' }
            ]);
            console.log(chalk.green('Seed completed: payment methods catalog inserted'));
        } else {
            console.log(chalk.yellow('Seed skipped: payment methods catalog already exist'));
        }

        const promoCount = await (await sequelize.getQueryInterface()).select(null, 'promotions');
        if (!Array.isArray(promoCount) || promoCount.length === 0) {
            console.log(chalk.blue('Seeding example promotion...'));
            const start = new Date();
            const end = new Date();
            end.setDate(end.getDate() + 30);
            const p = await require('../models/Promotion').create({ name: 'Bienvenida 10%', type: 'percentage', value: 10, start_at: start, end_at: end, active: true });
            const someProducts = await Product.findAll({ limit: 2 });
            if (someProducts.length) {
                await require('../models/PromotionProduct').bulkCreate(someProducts.map(sp => ({ promotion_id: p.id_promotion, product_id: sp.id_product })));
            }
            console.log(chalk.green('Seed completed: example promotion inserted'));
        } else {
            console.log(chalk.yellow('Seed skipped: promotions already exist'));
        }
    } catch (e) {
        console.error(chalk.red(`Seed failed: ${e.message}`));
        throw e;
    }
}

module.exports = { seedInitialData };
