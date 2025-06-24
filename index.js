const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const chalk = require('chalk');
const User = require('./src/models/User');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

console.log(chalk.cyanBright(`
   ╔════════════════════════════════════╗
   ║       NexaBot Server v1.0.0        ║
   ║  Powered by Node.js & MongoDB      ║
   ╚════════════════════════════════════╝
`));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log(chalk.greenBright('✅ MongoDB Connected Successfully'));
}).catch(err => {
  console.error(chalk.redBright('❌ MongoDB Connection Failed:'), err.message);
  process.exit(1);
});

app.use((req, res, next) => {
  console.log(chalk.blueBright(`[${new Date().toISOString()}] ${req.method} ${req.url}`));
  next();
});

const commandRoutes = require('./src/routes/commandRoutes');
const authRoutes = require('./src/routes/authRoutes');
app.use('/api', commandRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/user', async (req, res) => {
  const uid = req.headers['x-user-uid'];
  if (!uid) {
    return res.status(400).json({ error: 'User UID is required' });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      name: user.name,
      uid: user.uid,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(chalk.red(`❌ Error fetching user ${uid}: ${error.message}`));
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/config', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/config/bot.json'), 'utf8'));

    res.json({
      botName: config.botName,
      botAvatar: config.botAvatar,
      contactUrl: config.contactUrl,
      contactButton: config.contactButton,
      description: config.description,
    });
  } catch (error) {
    console.error(chalk.red(`❌ Error loading bot config: ${error.message}`));
    res.status(500).json({ error: 'Failed to load bot config' });
  }
});

const commandFiles = fs.readdirSync(path.join(__dirname, 'src/controllers/commands'))
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./src/controllers/commands/${file}`);
  console.log(chalk.yellow(`Loaded Command: ${command.name}`));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/auth.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(chalk.greenBright(`🚀 Server Running on http://localhost:${PORT}`));
});