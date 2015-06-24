var express = require('express'),
router = express.Router();
// This route does absolutely nothing
router.get('/', function(req, res){
    console.log('this does nothing !#$$%@#$#');
    res.sendFile('index.html');
});

module.exports = router;