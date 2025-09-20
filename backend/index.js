require('dotenv').config({ path: __dirname + '/.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');

// Debug logging
console.log('Current directory:', __dirname);
console.log('API Key available:', !!process.env.API_KEY);

if (!process.env.API_KEY) {
  console.error('Error: API_KEY not found in environment variables');
  process.exit(1);
}

// System prompt for consistent bot personality
const systemPrompt = `You are a friendly financial advisor.
Use simple terms and emojis. Limit responses to 2 sentences.`;

// Few-shot examples to guide response format
const examples = `
User: How to save money?
Bot: 💡 Start with a 20% income save rule! Track expenses via apps like Splitwise.
User: What is a mutual fund?
Bot: 🤝 A pool where many invest in stocks/bonds. Low risk!`;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Store conversation history
const chatHistory = [];

// Handle user input and generate response
async function handleInput(userInput) {
  try {
    // Construct prompt with context
    const prompt = `${systemPrompt}\n${examples}\nUser: ${userInput}\nBot:`;
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Store in history
    chatHistory.push({ user: userInput, bot: response });
    return response;
  } catch (error) {
    console.error('Error:', error.message);
    return '😕 Sorry, I encountered an error. Please try again!';
  }
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Recursive function to keep the conversation going
function chat() {
  rl.question("\n👋 Ask me about finance (or type 'exit' to quit)!\n> ", async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('\n👋 Thanks for chatting! Stay financially savvy!');
      rl.close();
      return;
    }

    const response = await handleInput(input);
    console.log('\nBot:', response);
    chat(); // Continue the conversation
  });
}

// Start the chat
console.log('\n🤖 Finance Buddy - Your Personal Finance Assistant');
console.log('------------------------------------------------');
console.log('Ask me about: saving money, investments, budgeting, or financial jokes!');
chat();