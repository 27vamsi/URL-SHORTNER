const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const { connectToMongoDB } = require('./connect');
const URL = require('./models/url');
const { checkForAuthentication, restrictTo } = require('./middlewares/auth');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRoute');
const userRoute = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 8001;
const MONGODB_URL = process.env.MONGODB_URL;

connectToMongoDB(MONGODB_URL).then(() => console.log('MongoDB connected'));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // for form data
app.use(cookieParser());

// CSRF protection using cookies
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Authentication
app.use(checkForAuthentication);

// Rate limiting
const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
});

const redirectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
});

// Only authenticated NORMAL users can manage URLs
app.use('/url', restrictTo(['NORMAL']), createUrlLimiter, urlRoute);
app.use('/', staticRoute);
app.use('/user', userRoute);

// Redirect short URL and track visit
app.get('/url/:shortId', redirectLimiter, async (req, res) => {
  const { shortId } = req.params;
  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: { timestamp: Date.now() },
      },
    }
  );

  if (!entry) {
    return res.status(404).end('Short URL not found');
  }

  return res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));

