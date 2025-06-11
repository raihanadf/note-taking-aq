const express = require('express');
const cors = require('cors');
const db = require('./models');
const todoRoutes = require('./routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todoRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

async function startServer() {
  console.log('Starting server, pls pls wait...');
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ force: false });
      console.log('Database tables synchronized.');
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
