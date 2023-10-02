const express = require('express');
const router = express.Router();
const sharps = require('../controllers/sharps');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateSharp } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Sharp = require('../models/sharp');

router.route('/')
    .get(catchAsync(sharps.index))
    .post(isLoggedIn, upload.array('image'), validateSharp, catchAsync(sharps.createSharp))


router.get('/new', isLoggedIn, sharps.renderNewForm)

router.route('/:id')
    .get(catchAsync(sharps.showSharp))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateSharp, catchAsync(sharps.updateSharp))
    .delete(isLoggedIn, isAuthor, catchAsync(sharps.deleteSharp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(sharps.renderEditForm))



module.exports = router;