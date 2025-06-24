const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const chalk = require('chalk');
const User = require('./src/models/User');
const ChatLog = require('./src/models/ChatLog');

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.path.includes('.css') || req.path.includes('.js')) {
      res.status(403).send(`

              <h1>403 Forbidden</h1>
              <h2>You don't have permission to access this resource.</h2>
              <p>Additionally, a 403 Forbidden error was encountered while trying to use an ErrorDocument to handle the request.</p>
          
      `);
      return;
  }
  next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

console.log(chalk.cyanBright('NexaBot Server v1.0.0 - Powered by Node.js & MongoDB'));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log(chalk.greenBright('MongoDB Connected Successfully'));
}).catch(err => {
    console.error(chalk.redBright('MongoDB Connection Failed:', err.message));
    process.exit(1);
});

app.use((req, res, next) => {
    console.log(chalk.blueBright(`[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${req.method} ${req.url}`));
    next();
});

const commandRoutes = require('./src/routes/commandRoutes');
const authRoutes = require('./src/routes/authRoutes');
app.use('/api', commandRoutes);
app.use('/api/auth', authRoutes);

app.post('/api/admin/signin', async (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (username === adminUsername && password === adminPassword) {
        res.json({ success: true, message: 'Admin sign-in successful' });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, 'name uid isAdmin isBanned createdAt');
        if (!users || users.length === 0) {
            console.log(chalk.yellow('No users found in database'));
            return res.status(404).json({ error: 'No users found' });
        }
        res.json(users);
    } catch (error) {
        console.error(chalk.red('Error fetching users:', error.message));
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.post('/api/admin/user/action', async (req, res) => {
    const { uid, action } = req.body;
    try {
        let user = await User.findOne({ uid });
        if (!user) {
            console.log(chalk.yellow(`User with UID ${uid} not found`));
            return res.status(404).json({ error: 'User not found' });
        }

        if (action === 'makeAdmin') {
            user.isAdmin = true;
        } else if (action === 'removeAdmin') {
            user.isAdmin = false;
        } else if (action === 'ban') {
            user.isBanned = true;
        } else if (action === 'unban') {
            user.isBanned = false;
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        await user.save();
        console.log(chalk.green(`${action} executed on user ${user.name} (UID: ${uid})`));
        res.json({ success: true, message: `${action} executed on ${user.name}` });
    } catch (error) {
        console.error(chalk.red('Error executing action on user:', error.message));
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalCommands = await ChatLog.countDocuments() || 0;
        const totalUsers = await User.countDocuments() || 0;
        const uptime = process.uptime(); 
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const serverStatus = process.uptime() > 0 ? 'Online' : 'Offline';

        res.json({
            totalCommands,
            totalUsers,
            uptime: `${days}d ${hours}h ${minutes}m`,
            serverStatus,
        });
    } catch (error) {
        console.error(chalk.red('Error fetching stats:', error.message));
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

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
        console.error(chalk.red('Error fetching user:', error.message));
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'src/config/bot.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ botName: 'Bot Dashboard', adminUsername: 'Admin' }, null, 2));
            console.log(chalk.yellow('Created default bot.json'));
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(chalk.green('Bot Config Loaded:', config.botName));
        res.json({
            botName: config.botName,
            botAvatar: config.botAvatar || '',
            contactUrl: config.contactUrl || '',
            contactButton: config.contactButton || '',
            description: config.description || '',
            adminUsername: config.adminUsername || 'Admin'
        });
    } catch (error) {
        console.error(chalk.red('Error loading bot config:', error.message));
        res.status(500).json({ error: 'Failed to load bot config', details: error.message });
    }
});

app.put('/api/config', (req, res) => {
    try {
        const { botName, botAvatar, contactUrl } = req.body;
        const configPath = path.join(__dirname, 'src/config/bot.json');
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        config.botName = botName || config.botName;
        config.botAvatar = botAvatar || config.botAvatar;
        config.contactUrl = contactUrl || config.contactUrl;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(chalk.green('Bot Config Updated:', botName));
        res.json({ success: true, message: 'Config updated successfully' });
    } catch (error) {
        console.error(chalk.red('Error updating bot config:', error.message));
        res.status(500).json({ error: 'Failed to update config', details: error.message });
    }
});

const commandFiles = fs.readdirSync(path.join(__dirname, 'src/controllers/commands'))
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/controllers/commands/${file}`);
    console.log(chalk.yellow('Loaded Command:', command.name));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(chalk.green('Server Running on http://localhost:' + PORT));
});