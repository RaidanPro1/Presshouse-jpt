const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fetch = require('node-fetch');

// --- Telegram Bot Setup ---
const token = process.env.TELEGRAM_BOT_TOKEN;
const ROOT_CHAT_ID = process.env.TELEGRAM_ROOT_CHAT_ID;
let bot;

if (token && ROOT_CHAT_ID) {
  bot = new TelegramBot(token, { polling: true });
  console.log('🤖 Telegram Bot initialized.');

  bot.on('polling_error', (error) => {
    console.error(`Telegram Polling Error: ${error.code} - ${error.message}`);
  });
  
  // Optional: Respond to /start command for confirmation
  bot.onText(/\/start/, (msg) => {
    if (String(msg.chat.id) === String(ROOT_CHAT_ID)) {
        bot.sendMessage(msg.chat.id, '🚀 **نظام المراقبة متصل.**', { parse_mode: 'Markdown' });
    }
  });

} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_ROOT_CHAT_ID not found in environment variables. Bot notifications will be disabled.');
}

// --- Express Server Setup ---
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- API Endpoints ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Notification endpoint for Telegram bot
app.post('/api/notify', (req, res) => {
    if (!bot) {
        return res.status(503).json({ status: 'error', message: 'Telegram Bot is not configured.' });
    }

    const { event, details, user, isRoot } = req.body;

    let icon = isRoot ? '🚨' : '🔔';
    let title = isRoot ? 'نشاط بصلاحيات جذرية (ROOT)' : 'نشاط مستخدم';
    
    const message = `${icon} <b>${title}</b>\n` +
                    `👤 <b>المستخدم:</b> ${user}\n` +
                    `📌 <b>الحدث:</b> ${event}\n` +
                    `📝 <b>التفاصيل:</b> ${details}\n` +
                    `⏰ <b>الوقت:</b> ${new Date().toLocaleTimeString('ar-YE')}`;

    bot.sendMessage(ROOT_CHAT_ID, message, { parse_mode: 'HTML' }).catch(err => {
        console.error("Failed to send Telegram message:", err.message);
    });
    
    res.json({ status: 'sent' });
});

// Panic button endpoint
app.post('/api/panic', (req, res) => {
    console.log('🚨 PANIC MODE TRIGGERED VIA API 🚨');
    
    // Respond immediately to the client
    res.status(202).json({ status: 'accepted', message: 'Panic sequence initiated.' });

    // Send Telegram alert first, as the subsequent commands might interrupt network
    if (bot) {
        const message = `🚨 *PANIC BUTTON ACTIVATED* 🚨\n\nCritical services (Proxy, Databases) are being shut down *immediately* via script.\nManual intervention is required to restore the system.`;
        bot.sendMessage(ROOT_CHAT_ID, message, { parse_mode: 'Markdown' });
    }

    // Execute the panic script inside the container (which has access to docker.sock)
    const scriptPath = '/opt/scripts/panic_mode.sh'; 
    
    exec(scriptPath, (error, stdout, stderr) => {
        if (error) {
            console.error(`Panic script execution error: ${error.message}`);
            // Attempt to send a failure alert
            if(bot) {
                 bot.sendMessage(ROOT_CHAT_ID, `🔥 *PANIC SCRIPT FAILED*\nError: ${error.message}`, { parse_mode: 'Markdown' });
            }
            return;
        }
        if (stderr) {
            console.error(`Panic script stderr: ${stderr}`);
        }
        console.log(`Panic script stdout: ${stdout}`);
    });
});

// Service management endpoint
app.post('/api/service/:action', (req, res) => {
    const { action } = req.params;
    const { serviceName } = req.body;

    const allowedActions = ['start', 'stop', 'restart'];
    // IMPORTANT: Whitelist of allowed service names to prevent command injection
    const allowedServices = [
      'ph-postgres', 'ph-mariadb', 'ph-portainer', 'ph-glances', 
      'ph-uptime-kuma', 'ph-keycloak', 'ph-n8n', 'ph-gitea', 
      'ph-ollama-engine', 'ph-yemenjpt-ui', 'ph-vector-db', 
      'ph-langfuse-server', 'ph-langfuse-ui', 'ph-libretranslate', 
      'ph-whisper-ui', 'ph-mattermost', 'ph-nextcloud', 'ph-secure-browser',
      'ph-vaultwarden', 'ph-searxng', 'ph-spiderfoot', 'ph-social-analyzer',
      'ph-changedetection', 'ph-archivebox', 'ph-meedan-check', 
      'ph-languagetool', 'ph-forensics', 'ph-nocodb', 'ph-internal-proxy',
      'yemenjpt_app', 'ph-label-studio', 'ph-azuracast', 'ph-ghost',
      'ph-posteio', 'ph-restreamer', 'ph-mixpost', 'ph-mongodb', 'ph-evolution-api',
      'mcp-server' // MCP Server is now a manageable service
    ];

    if (!allowedActions.includes(action)) {
        return res.status(400).json({ error: 'Invalid action.' });
    }
    if (!allowedServices.includes(serviceName)) {
        return res.status(400).json({ error: 'Invalid or disallowed service name.' });
    }
    
    // Sanitize inputs
    const sanitizedAction = action.replace(/[^a-zA-Z]/g, '');
    const sanitizedServiceName = serviceName.replace(/[^a-zA-Z0-9_-]/g, '');

    const command = `docker ${sanitizedAction} ${sanitizedServiceName}`;
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Docker command: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute command.', details: stderr });
        }
        res.status(200).json({ message: `Service ${sanitizedServiceName} ${sanitizedAction}ed successfully.`, output: stdout });
    });
});

// MCP Server Proxy Endpoint
app.post('/api/mcp/execute', async (req, res) => {
    const mcpServerUrl = 'http://mcp-server:4000/execute';
    console.log(`Forwarding request to MCP server: ${mcpServerUrl}`);

    try {
        const response = await fetch(mcpServerUrl, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error forwarding request to MCP server:', error);
        res.status(502).json({ error: 'Bad Gateway', details: 'Could not connect to the MCP server.' });
    }
});


app.listen(port, () => {
  console.log(`✅ YemenJPT backend listening at http://localhost:${port}`);
});
