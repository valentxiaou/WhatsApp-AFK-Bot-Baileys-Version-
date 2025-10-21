# WhatsApp-AFK-Bot-Baileys-Version-

🧩 Requirements
• Node.js v18 or higher
• NPM or Yarn
• Basic understanding of Baileys (WhatsApp Web API)

⚙️ Installation
git clone https://github.com/yourusername/whatsapp-afk-bot.git
cd whatsapp-afk-bot
npm install

▶️ Usage
Run the bot:
node main.js
Then scan the QR code from your terminal to connect.

🧠 How It Works
When a user sends /afk <reason>, the bot saves their JID, timestamp, and reason.
If someone mentions them, the bot replies with their AFK reason and how long they've been away.
When the AFK user sends a message again, their AFK status is automatically removed
