const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8008;

app.get('/numbers', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Invalid input: url parameter is missing.' });
  }

  const urls = Array.isArray(url) ? url : [url];

  const responsePromises = urls.map(async (url) => {
    try {
      const { data } = await axios.get(url, { timeout: 500 });
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${url}: ${error.message}`);
      return null; // Ignore URLs that take too long to respond
    }
  });

  try {
    const responses = await Promise.all(responsePromises);
    const mergedNumbers = responses
      .filter((data) => data && Array.isArray(data) && data.every(Number.isInteger))
      .flatMap((data) => data)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);

    return res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error('Error processing the request:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
