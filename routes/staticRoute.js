const express = require('express');
const URL = require('../models/url');

const router = express.Router();

// Home page - show URLs created by logged-in user
router.get('/', async (req, res) => {
  if (!req.user) return res.redirect('/login');

  const allUrls = await URL.find({ createdBy: req.user._id });

  return res.render('home', {
    urls: allUrls,
    csrfToken: req.csrfToken(),
  });
});

router.get('/signup', (req, res) => {
  return res.render('signup', {
    csrfToken: req.csrfToken(),
  });
});

router.get('/login', (req, res) => {
  return res.render('login', {
    csrfToken: req.csrfToken(),
  });
});

module.exports = router;

