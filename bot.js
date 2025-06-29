import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import TelegramBot from "node-telegram-bot-api";

// ENV variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const MODEL = process.env.MODEL || "anthropic/claude-3-sonnet";

// Start bot with polling + delay
const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: {
    interval: 300,     // Check every 300ms
    params: {
      timeout: 30      // Polling timeout
    }
  }
});

// Simple Hindi check
function detectLanguage(text) {
  const hindiChars = /[\u0900-\u097F]/;
  return hindiChars.test(text) ? "hi" : "en";
}

// OpenRouter API call
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
          {
            role: "system",
            content: "Reply in the same language as user input. Be helpful, friendly, and polite."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "⚠️ No response from AI.";
  } catch (err) {
    console.error("Error:", err);
    return "❌ Error contacting AI.";
  }
}

// Handle Telegram messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  bot.sendChatAction(chatId, "typing");

  const reply = await getAIReply(text);
  bot.sendMessage(chatId, reply);
});
