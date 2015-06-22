var express = require("express");
var app = express();

app.listen(3000);

app.get("/", function(request, response){
    response.send({"text":"This would be some html"});
});
app.get("/login", function(request, response){
    response.send({"text":"login"});
});
app.get("/logout", function(request, response){
    response.send({"text":"logout"});
});
app.get("/register", function(request, response){
    response.send({"text":"register"});
});