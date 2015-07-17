$(document).ready(function(){
    $('#createGame').on('click','.letter',function(event){
        var color = this.dataset.color;
        $(this).toggleClass(color + ' btn-primary guessSelection');
        var selection = $('.guessSelection').length;
        if (selection > 3){
            $('input[name="wordSubmission"]').val("Submit");
            // $('input[name="wordSubmission"]').removeAttr("disabled");
        }
        else if (selection > 0){
            $('input[name="wordSubmission"]').val("...");
            // $('input[name="wordSubmission"]').attr("disabled","disabled");
        }else if (selection==0){
            $('input[name="wordSubmission"]').val("Pass");
            // $('input[name="wordSubmission"]').removeAttr("disabled");
        }
    });
    $('#createGame').on('submit','#guessForm',function(event){
        event.preventDefault();

        var form = this,
        validGuess = true,
        currentGuess = [],
        guessString = "",
        validColor = false,
        letters = $('.guessSelection');
        var lettersLength = letters.length;
        form.elements.guess.value = guessString;
        if (lettersLength == 0){
            validColor = true;
        }
        else if (lettersLength < 4){
            validGuess = false;
        }
        else if (lettersLength != 0){
            // Probably faster to convert to integers first and then check
            var yDiff,xDiff;
            letters.each(function(index,element){
                if (!validColor && element.dataset.color != "btn-danger"){
                    validColor = true;
                }
                guessString += $(element).html();
                if (index != 0){
                    previous = letters[index-1].name.split(",");
                    current = element.name.split(",");
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
                currentGuess.push(element.name);
            });
        }
        if (!validGuess || !validColor){
            // Create An Alert Box or Message Box For Invalid Guesses
            console.log("Invalid Guess.");
            $('.guessSelection').each(function(index,element){
                $(element).toggleClass(element.dataset.color + ' btn-primary guessSelection');
            });
        }
        else{
            // Submit button needs the playerID
            form.elements.guess.value = guessString;
            var gameID = form.elements.gameID.value;
            if (currentGuess.length == 0){
                form.elements.word.value = "";
            }
            else{
                form.elements.word.value = currentGuess.join(";");
            }
            $.post('/games/play',$(form).serialize(),function(data){
                // create event to be triggered
                if(!data.success){
                    var message = $('<p>').text(data.message);
                    $('#gameAlerts').html(message);
                    return false;
                }
                else{
                    $('#createGame').trigger('endOfTurn',[gameID]);
                }
            });
        }
    });
});