const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cardRoutes = require('./routes/cardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);

// Database Auto-bootstrapper
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Se no .env estiver localhost padrão, criamos um banco portátil automaticamente
    if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      console.log('📦 Inicializando Banco de Dados Automático (Portátil)...');
      
      const dbPath = path.join(__dirname, 'database_data');
      if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

      const mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath: dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      mongoUri = mongod.getUri();
      console.log(`✅ Banco de Dados Portátil rodando na memória em ${mongoUri}`);
    }

    mongoose.connect(mongoUri)
      .then(() => {
        console.log('✅ Conexão com MongoDB estabelecida com Sucesso!');
        app.listen(PORT, () => {
          console.log(`🚀 Servidor e API rodando na porta ${PORT}`);
        });
      })
      .catch((err) => {
        console.error('❌ Erro conectando ao MongoDB:', err.message);
      });

  } catch (err) {
    console.error('Erro Fatal ao iniciar servidor e banco de dados:', err);
    process.exit(1);
  }
};

startServer();
