(async function(){
    const HITLER = 0;
    const MARX = 1;
     let quotes = [];
    let currentQuoteIndex = 0;
    let answered = false;
    let answers = [];

    await (async function loadQuotes(){
        // we need to load the quotes, which is a b64 encoded json string
        // this is to keep naughty words out of my github
        fetch('quotes.b64')
            .then(x => x.text())
            .then(t => atob(t))
            .then(json => JSON.parse(json))
            .then(q => quotes = q);
    })();

    function randomiseQuotes(){
        for(var quote of quotes){
            quote.order = Math.random();
        }

        quotes = quotes.sort((x, y) => x.order > y.order);
    }
    
    const landingPage = document.getElementById('landing-page');
    const quizPage = document.getElementById('quiz-page');
    const resultsPage = document.getElementById('results-page');

    const quizStartButton = document.getElementById('quiz-start');
    const quizNextQuoteButton = document.getElementById('quiz-next-quote');

    const quizLeftImage = document.getElementById('quiz-left-image');
    const quizRightImage = document.getElementById('quiz-right-image');

    const quizQuoteCounter = document.getElementById('quiz-quote-counter');

    const quizMarxImage = document.getElementById('quiz-marx-image');
    const quizHitlerImage = document.getElementById('quiz-hitler-image');

    const quoteActual = document.getElementById('quiz-quote-actual');
    const quoteAttribution = document.getElementById('quiz-quote-attribution');
    const quoteRight = document.getElementById('quiz-quote-right');
    const quoteWrong = document.getElementById('quiz-quote-wrong');

    const resultTemplate = document.getElementById('result-template');
    const resultsSummaryTotal = document.getElementById('results-summary-total');
    const resultsSummaryDescription = document.getElementById('results-summary-description');
    const resultsList = document.getElementById('results-list');
    const quizResetButton = document.getElementById('quiz-reset');

    function startQuiz(){
        quizNextQuoteButton.disabled = true;
        updateCounter();
        randomiseQuotes();
        hide(landingPage);
        show(quizPage);
        quoteActual.innerHTML = "\"" + quotes[currentQuoteIndex].quote + "\"";
    }

    function answer(quote, val){
        if(answered){return;}
        var answeredQuote = Object.assign({}, quote, {answer: val});
        quizLeftImage.classList.remove('left-unhide');
        quizLeftImage.classList.remove('left-reset');
        quizRightImage.classList.remove('right-unhide');
        quizRightImage.classList.remove('right-reset');
        answers.push(answeredQuote);
        showAnswer(answeredQuote);
        answered = true;
        quizNextQuoteButton.disabled = false;
    }

    function answerMarx(){
        var quote = quotes[currentQuoteIndex];
        answer(quote, MARX);
    }

    function answerHitler(){
        var quote = quotes[currentQuoteIndex];
        answer(quote, HITLER);
    }

    function showAnswer(answeredQuote){
        quoteAttribution.innerHTML = (answeredQuote.author ? '- Karl Marx, ' : '- Adolf Hitler, ') + '<span id="quiz-quote-loc">' + answeredQuote.attribution + '</span>'; 
        showInline(quoteAttribution);
        if(answeredQuote.answer === answeredQuote.author){
            show(quoteRight);
            hide(quoteWrong);
        } else {
            show(quoteWrong);
            hide(quoteRight);
        }
        if(answeredQuote.author){
            // M
            quizLeftImage.classList.add('left-move');
            quizRightImage.classList.add('right-hide');
        } else {
            // H
            quizRightImage.classList.add('right-move');
            quizLeftImage.classList.add('left-hide');
        }
    }

    function nextQuote(){
        hide(quoteRight, quoteWrong, quoteAttribution);
        if(quizLeftImage.classList.contains('left-move')){
            quizLeftImage.classList.add('left-reset');
            quizLeftImage.classList.remove('left-move');
            quizRightImage.classList.add('right-unhide');
            quizRightImage.classList.remove('right-hide');
        } else {
            quizLeftImage.classList.add('left-unhide');
            quizLeftImage.classList.remove('left-hide');
            quizRightImage.classList.add('right-reset');
            quizRightImage.classList.remove('right-move');
        }
        answered = false;
        if((currentQuoteIndex+1) === quotes.length){
            finishQuiz();
            return;
        }
        currentQuoteIndex++;
        var quote = quotes[currentQuoteIndex];
        updateCounter();
        quoteActual.innerHTML = "\"" + quote.quote + "\"";
        quizNextQuoteButton.disabled = true;
    }

    function finishQuiz(){
        hide(quizPage);
        show(resultsPage);
        answered = false;
        var totalCount = quotes.length;
        var correctCount = answers.filter(x => x.answer === x.author).length;
        resultsSummaryTotal.innerHTML = correctCount + ' / ' + totalCount + ' correct.';
        var correctRatio = correctCount / totalCount;
        if(correctRatio < 0.25){
            resultsSummaryDescription.innerHTML = 'No-one should score this low, read some history!';
        } else if(correctRatio < 0.5){
            resultsSummaryDescription.innerHTML = 'Not a great score, but the quiz is hard.';
        } else if(correctRatio == 0.5){
            resultsSummaryDescription.innerHTML = 'Exactly half, did you guess at random?'
        }else if(correctRatio < 0.75){
            resultsSummaryDescription.innerHTML = 'Good score, or great guessing.';
        }else if(correctRatio < 1){
            resultsSummaryDescription.innerHTML = 'Very good score, good job distinuishing some difficult quotes.';
        }else {
            resultsSummaryDescription.innerHTML = 'Perfect score. You are either extremely knowledgeable, or a cheater.';
        }
        for(var i = 0; i < answers.length; i++){
            var answer = answers[i];
            var clone = resultTemplate.content.cloneNode(true);
            var quote = clone.querySelectorAll('.result-quote')[0];
            var attribution = clone.querySelectorAll('.result-attribution')[0];
            var right = clone.querySelectorAll('.result-right')[0];
            var wrong = clone.querySelectorAll('.result-wrong')[0];
            quote.innerHTML = answer.quote;
            attribution.innerHTML = (answer.author ? '- Karl Marx, ' : '- Adolf Hitler, ') + '<span class="result-loc">' + answer.attribution + '</span>';
            if(answer.author === answer.answer){
                show(right);
                hide(wrong);
                clone.querySelectorAll('.result')[0].classList.add('correct');
            } else {
                hide(right);
                show(wrong);
                clone.querySelectorAll('.result')[0].classList.add('incorrect');
            }
            resultsList.appendChild(clone);
        }
    }

    function resetQuiz(){
        hide(resultsPage);
        resultsList.innerHTML = '';
        answers = [];
        answered = false;
        currentQuoteIndex = 0;
        startQuiz();
    }

    function updateCounter(){
        quizQuoteCounter.innerHTML = (currentQuoteIndex + 1) + '/' + quotes.length;
    }

    quizStartButton.onclick = startQuiz;
    quizMarxImage.onclick = answerMarx;
    quizHitlerImage.onclick = answerHitler;
    quizNextQuoteButton.onclick = nextQuote;
    quizResetButton.onclick = resetQuiz;
    function hide(){
        for(var i = 0; i < arguments.length; i++){
            arguments[i].style = "display: none";
        }
    }

    function show(){
        for(var i = 0; i < arguments.length; i++){
            arguments[i].style = "display: flex";
        }
    }

    function showInline(){
        for(var i = 0; i < arguments.length; i++){
            arguments[i].style = "display: inline";
        }
    }
}());