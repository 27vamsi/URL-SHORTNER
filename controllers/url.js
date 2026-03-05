const { nanoid } = require('nanoid');
const URL = require('../models/url');

async function handleGenerateNewShortURL(req, res) {
  const shortId = nanoid(8);
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  await URL.create({
    shortId,
    redirectURL: parsedUrl.toString(),
    visitHistory: [],
    createdBy: req.user._id,
  });

  return res.render('home', { id: shortId, csrfToken: req.csrfToken() });
}

async function handleGetAnalytics(req, res) {
  const { shortId } = req.params;
  const result = await URL.findOne({ shortId });

  if (!result) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};

