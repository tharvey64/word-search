var express = require('express'),
path = require('path'),
router = express.Router();
// This route does absolutely nothing
router.get('/', function(req, res){
    res.sendFile(path.join(__dirname ,'../../public/','base.html'));
});

module.exports = router;