import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'

// Store AFK users data
const afkUsers = new Map()

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' })
  })

  // Handle connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log('✅ WhatsApp AFK Bot connected!')
    }
  })

  // Handle incoming messages
  sock.ev.on('messages.upsert', async (msgUpdate) => {
    const msg = msgUpdate.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const sender = msg.key.participant || msg.key.remoteJid
    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

    // --- COMMAND: /afk ---
    if (text.startsWith("/afk")) {
      const reason = text.split(" ").slice(1).join(" ") || "No reason provided."
      afkUsers.set(sender, { since: Date.now(), reason })
      await sock.sendMessage(from, { text: `💤 *${getUsername(sender)} is now AFK.*\nReason: ${reason}` })
      return
    }

    // --- Disable AFK if user sends message ---
    if (afkUsers.has(sender)) {
      afkUsers.delete(sender)
      await sock.sendMessage(from, { text: `👋 Welcome back *${getUsername(sender)}*, your AFK mode is now off.` })
      return
    }

    // --- Notify others if they mention an AFK user ---
    for (const [user, data] of afkUsers.entries()) {
      if (text.includes(user.split('@')[0])) {
        const elapsed = formatTime(Date.now() - data.since)
        await sock.sendMessage(from, {
          text: `📴 *${getUsername(user)}* is currently AFK (${elapsed} ago)\nReason: ${data.reason}`
        })
        break
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

function getUsername(jid) {
  return jid.split('@')[0]
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const hrs = Math.floor(min / 60)

  if (hrs > 0) return `${hrs}h ${min % 60}m`
  if (min > 0) return `${min}m ${sec % 60}s`
  return `${sec}s`
}

startBot()
