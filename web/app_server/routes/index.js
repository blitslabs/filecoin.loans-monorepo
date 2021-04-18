const express = require('express')
const router = express.Router()
const appController = require('../controllers/app')

router.get('/', appController.renderApp)
router.get('/dashboard', appController.renderApp)

module.exports = router