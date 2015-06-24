var express = require('express'),
router = express.Router();
// This route does absolutely nothing
router.get('/', function(req, res){
    res.sendFile('index.html');
});

module.exports = router;