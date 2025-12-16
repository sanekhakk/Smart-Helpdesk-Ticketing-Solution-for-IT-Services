const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const categorizeTicket = async (description) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Categorize: ${description}. Return only one word: Hardware, Software, or Network.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.log("AI Limit reached, using manual fallback...");
    // Fallback logic: Simple keyword detection
    if (description.toLowerCase().includes("wifi") || description.toLowerCase().includes("internet")) return "Network";
    if (description.toLowerCase().includes("laptop") || description.toLowerCase().includes("printer")) return "Hardware";
    return "Software"; 
  }
};

module.exports = { categorizeTicket };