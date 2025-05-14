const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const searchGoogle = async (query, maxResults = 5) => {
  try {
    const url = "https://www.googleapis.com/customsearch/v1";
    const params = {
      key: GOOGLE_API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: query,
      num: maxResults,
    };
    const res = await axios.get(url, { params });
    const items = res.data.items || [];
    const results = items.map(
      (item) => `- ${item.title}: ${item.snippet} (Source: ${item.link})`
    );
    return results.length ? results.join('\n') : 'No relevant results found.';
  } catch (error) {
    console.error('Google Search Error:', error.message);
    return 'Error fetching search results.';
  }
};

const generateResponse = async (userPrompt) => {
  const searchResults = await searchGoogle(userPrompt);

  const prompt = `
You are a tourism assistant bot for Tamil Nadu. Use the search results below to answer the user's question in 1–2 sentences. Be brief, accurate, and include one emoji.

User Question: ${userPrompt}

Search Results:
${searchResults}

Respond with:
- A direct short answer (1–2 sentences)
- Include a source URL if available
- Use one emoji if relevant
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a helpful tourism chatbot for Tamil Nadu.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    return 'Sorry, I couldn’t process your request right now. 😔';
  }
};

router.post('/ask', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const answer = await generateResponse(query);
  res.json({ answer });
});

module.exports = router;