const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, authorize('ADMIN'), getUsers);
// profile/me must be before /:id to avoid being caught by the param route
router.put('/profile/me', authenticate, upload.single('avatar'), updateProfile);
router.get('/:id', authenticate, authorize('ADMIN'), getUserById);
router.put('/:id', authenticate, authorize('ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

module.exports = router;
