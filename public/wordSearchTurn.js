$(document).ready(function(){
    // This Code Should Use Jquery and not DOM Code
    $('#createGame').on('click','.letter',function(event){
        var color = this.dataset.color;
        $(this).toggleClass(color + ' btn-primary guessSelection');
        var selection = $('.guessSelection').length;
        if (selection > 3){
            $('button[name="wordSubmission"]').html("Submit");
            $('button[name="wordSubmission"]').removeAttr("disabled");
        }
        else if (selection > 0){
            $('button[name="wordSubmission"]').html("...");
            $('button[name="wordSubmission"]').attr("disabled","disabled");
        }else if (selection == 0){
            $('button[name="wordSubmission"]').html("Pass");
            $('button[name="wordSubmission"]').removeAttr("disabled");
        }
        var selectionString = "";
        // Move check code here make it a function
        $('.guessSelection').each(function(idx,el){
            selectionString += $(el).html();
        });
        $('#visibleInput').val(selectionString)

    });
    $('#createGame').on('submit','#guessForm',function(event){
        event.preventDefault();
        $('button[name="wordSubmission"]').removeAttr("disabled");
        var form = $(this),
        validGuess = true,
        currentGuess = [],
        guessString = "",
        letters = $('.guessSelection');
        var lettersLength = letters.length;
        // Fix This Form
        $('#visibleInput').val("");
        if (lettersLength < 4 && lettersLength > 0){
            validGuess = false;
        }
        else {
            // Probably faster to convert to integers first and then check
            var yDiff,xDiff;
            letters.each(function(index,element){
                guessString += $(element).html();
                if (index != 0){
                    previous = $(letters[index-1]).attr("name").split(",");
                    current = $(element).attr("name").split(",");
                    if (index == 1){
                        yDiff = Number(current[0])-Number(previous[0])
                        if (yDiff > 1 || yDiff < -1){
                            validGuess = false;
                            return false;
                        } 
                        xDiff = Number(current[1])-Number(previous[1])
                        if (xDiff > 1 || xDiff < -1){
                            validGuess = false;
                            return false;
                        } 
                    }
                    else{
                        if (Number(current[0])-Number(previous[0]) != yDiff){
                            validGuess = false;
                            return false;
                        }
                        if (Number(current[1])-Number(previous[1]) != xDiff){
                            validGuess = false;
                            return false;
                        }
                    }
                }
                currentGuess.push($(element).attr("name"));
            });
        }
        if (!validGuess){
            // Create An Alert Box or Message Box For Invalid Guesses
            var message = $('<p>').text("Invalid Guess");
            $('#gameAlertsBox').html(message);
            $('.guessSelection').each(function(index,element){
                $(element).toggleClass(element.dataset.color + ' btn-primary guessSelection');
            });
        }
        else{
            // Submit button needs the playerID
            $("#visibleInput").val(guessString);
            var gameID = form.children("input[name='gameID']").val();
            if (currentGuess.length == 0){
                form.children("input[name='word']").val("");
            }
            else{
                // console.log(currentGuess)
                // console.log($.param({a:currentGuess},true));
                form.children("input[name='word']").val(currentGuess.join(";"));
            }

            $.post($(form).attr("action"),$(form).serialize(),function(data){
                // create event to be triggered
                if(!data.success){
                    var message = $('<p>').text(data.message);
                    $('#gameAlertsBox').html(message);
                }
                else{
                    $('#createGame').trigger('endOfTurn',[gameID]);
                }
                $('.guessSelection').each(function(index,element){
                    $(element).toggleClass(element.dataset.color + ' btn-primary guessSelection');
                });
            });
        }
    });
});