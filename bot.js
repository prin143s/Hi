import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const MODEL = process.env.MODEL || "anthropic/claude-3-sonnet";

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Language detection (simple Hindi check)
function detectLanguage(text) {
  const hindiChars = /[\u0900-\u097F]/;
  return hindiChars.test(text) ? "hi" : "en";
}

// Get AI reply from OpenRouter
async function getAIReply(message) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "Reply in the same language as user input. Be helpful and smart." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "⚠️ No response from AI.";
  } catch (err) {
    console.error("Error getting AI reply:", err);
    return "❌ Error contacting AI server.";
  }
}

// Handle Telegram messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  if (!userInput) return;

  bot.sendChatAction(chatId, "typing");
  const reply = await getAIReply(userInput);
  bot.sendMessage(chatId, reply);
});
