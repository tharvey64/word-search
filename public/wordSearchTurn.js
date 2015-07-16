$(document).ready(function(){
    $('#createGame').on('click','.letter',function(event){
        console.log(this);
        $(this).toggleClass('btn-success btn-primary guessSelection');
        // No Matter the order the elements are returned in increasing order
        // 2 point equation for a line m = (y2-y1)/(x2-x1)
        // check these two conditions before
        // if y2-y1 == 0: line is horizontal 
        // if x2-x1 == 0: line is vertical
        // m should equal 1 or -1 in all other cases 
        // b = y - xm
        // The Equation of the line  is y = xm+b
        // The DOM Tree seems to return them in ascending order
        // I should be able to determine validity of an input set
        // by adding 1 to x each time  
    });
});