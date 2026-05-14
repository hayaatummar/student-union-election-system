const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('studentId').optional().trim(),
  body('department').optional().trim(),
  body('role').optional().isIn(['STUDENT', 'CANDIDATE']).withMessage('Invalid role'),
  validate,
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], login);

router.get('/me', authenticate, getMe);

router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], changePassword);

module.exports = router;
