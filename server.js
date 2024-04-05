const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    const url = "http://61.1.174.28/jsp/RCRVInfo.jsp";
    try {
        const response = await axios.get(url);
        const htmlContent = response.data;
        const $ = cheerio.load(htmlContent);
        const h3Tags = $('h3');
        const content = [];
        h3Tags.each((index, element) => {
            const text = $(element).text().trim();
            content.push(text);
        });
        const pattern = /\*?\((.*?)\)\s+(.*?)\.+\s+LAST DATE TO APPLY FOR\s+(.*?):\s+(\d{2}-\d{2}-\d{4})/;
        const result = content.map(string => {
            const match = string.match(pattern);
            if (match) {
                const releaseDate = match[1];
                const notification = match[2];
                const endDate = match[4];
                return {
                    releaseDate,
                    notification,
                    warning: `Last date to apply for ${match[3]} is ${endDate}`
                };
            }
        }).filter(Boolean);
        if (req.query.query) {
            const query = req.query.query.toLowerCase();
            const filteredResults = result.filter(entry => {
                return (
                    entry.releaseDate.toLowerCase().includes(query) ||
                    entry.notification.toLowerCase().includes(query) ||
                    entry.warning.toLowerCase().includes(query)
                );
            });
            res.json(filteredResults);
        } else {
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
