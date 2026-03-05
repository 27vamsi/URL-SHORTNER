const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { setUser } = require('../service/auth');

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('signup', {
      error: 'Name, email and password are required',
      csrfToken: req.csrfToken(),
    });
  }

  if (!isValidEmail(email)) {
    return res.render('signup', {
      error: 'Please enter a valid email address',
      csrfToken: req.csrfToken(),
    });
  }

  if (password.length < 6) {
    return res.render('signup', {
      error: 'Password must be at least 6 characters long',
      csrfToken: req.csrfToken(),
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.render('signup', {
      error: 'An account with this email already exists',
      csrfToken: req.csrfToken(),
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return res.redirect('/login');
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', {
      error: 'Email and password are required',
      csrfToken: req.csrfToken(),
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.render('login', {
      error: 'Invalid email or password',
      csrfToken: req.csrfToken(),
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('login', {
      error: 'Invalid email or password',
      csrfToken: req.csrfToken(),
    });
  }

  const token = setUser(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  return res.redirect('/');
}

function handleUserLogout(req, res) {
  res.clearCookie('token');
  return res.redirect('/login');
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
};

