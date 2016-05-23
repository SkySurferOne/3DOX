$(document).ready(function() {
    
    //audio
    var soundtrack = new Audio();
    soundtrack.src = window.location.href+'sfx/soundtrack.ogg';
    soundtrack.volume = 0.5;
    soundtrack.loop = true;
    var playMusic = true;
    
    if(playMusic) soundtrack.play();
    
    var kk = {
        WYBRANO: 1,
	    NIE_WYBRANO: 0,
        WYBRALES: 2
    };
    
    //var guiBox = $('#GUI');
    var menuBox = $('#menu');
    var mainMenuBox = $('#main-menu');
    var choiceBox = $('#choice-box');
    var playerInfo = $('.player-info');
    var endInfoBox = $('.endInfo-box');
    var leftInfo = $('#player-info-left');
    var rightInfo = $('#player-info-right');
    
    var optionsBox = $('#options-box');
    var aboutBox = $('#about-box');
    var returnBtn = $('.return-btn');
    
    var switchMusic = $('.switchMusic');
    var volRange = $('#volRange');
    var switchHide = $('.switchHide');
    
    var yourName = $('#yourNick');
    var oppName = $('#oppNick');
    var yourScore = $('#yourScore');
    var oppScore = $('#oppScore');
    var endInfo = $('#endInfo');
    var yourSignSpan = $('#yourSign');
    var oppSignSpan = $('#oppSign');
    
    threedox.boxes.yourName = yourName;
    threedox.boxes.oppName = oppName;
    threedox.boxes.yourScore = yourScore;
    threedox.boxes.oppScore = oppScore;
    threedox.boxes.yourSignSpan = yourSignSpan;
    threedox.boxes.oppSignSpan = oppSignSpan;
    threedox.boxes.leftInfo = leftInfo;
    threedox.boxes.rightInfo = rightInfo;
    
    //main-menu
    var newGameBtn = $('#new-game');
    var optionsBtn = $('#options');
    var aboutBtn = $('#about');
    
    var okBtn = $('#ok-btn');
    
    //choice-box
    var oChoice = $('#o-choice');
    var xChoice = $('#x-choice');
    
    //add events
    newGameBtn.click(newGameFn);
    optionsBtn.click(optionsFn);
    aboutBtn.click(aboutFn);
    
    oChoice.click(choiceClick);
    xChoice.click(choiceClick);
    
    okBtn.click(setDef);
    returnBtn.click(returnBtnFn);
    
    switchMusic.click(switchMusicFn);
    switchHide.click(switchHideFn);
    
    volRange.on("input", volRangeChange);

    threedox.onDraw = function() {
        playerInfo.hide();
        endInfo.text('Is draw.');
        menuBox.show();
        endInfoBox.show();
        
        sinRotation = true;
    };
    
	threedox.onWin = function() {
        playerInfo.hide();
        endInfo.text('You Won!');
        menuBox.show();
        endInfoBox.show();
        
        sinRotation = true;
    };
    
	threedox.onLose = function() {
        playerInfo.hide();
        endInfo.text('You lose.');
        menuBox.show();
        endInfoBox.show();
        
        sinRotation = true;
    };
    
    //events' functions 
    function choiceClick(e) {
        e.preventDefault();
        
        var sign = $(this).attr('value');
        console.log('You clicked '+sign);
        
        makeChoice(sign);
        
    }
    
    function setDef() {
        playerInfo.hide(); 
        endInfoBox.hide();
        choiceBox.hide();
        menuBox.show();
        mainMenuBox.show();
        
        threedox.setDef();
    }
    
    onFriendDisconnection(function(text) {
        playerInfo.hide();
        endInfo.text(text);
        menuBox.show();
        endInfoBox.show();
        sinRotation = true;
    });
    
    function newGameFn(e) {
        e.preventDefault();
        console.log('new game clicked');
        
        newGameInit(signStateCallback);
    }
    
    function signStateCallback(data) {
         if(typeof err !== 'undefined' && err !== false)
                console.error(data.err);
        
         if(data.kk === kk.WYBRALES) {
             console.log('Wybraleś '+data.takeSign);
             closeMenu();
             startGame('');
             
         } else if(data.kk === kk.WYBRANO) {
             console.log('Ktoś już wybral znak, ty masz '+data.takeSign);
             closeMenu();
             startGame('start');
             
        } else if(data.kk === kk.NIE_WYBRANO) {
            console.log('wybierz symbol');
            mainMenuBox.hide();
            choiceBox.show();
            
        }
        
    }
    
    function closeMenu() {
        menuBox.hide();
        mainMenuBox.hide();
        choiceBox.hide();
        playerInfo.show();
    }
    
    function startGame(flag) {
        threedox.update(flag);
        sinRotation = false;
    }
    
    function optionsFn(e) {
        e.preventDefault();
        console.log('options clicked');
        
        if(playMusic) {
            $('#musicOn').addClass('gray');
            $('#musicOff').removeClass('gray');
            
        } else {
            $('#musicOn').removeClass('gray');
            $('#musicOff').addClass('gray');
            
        }
        
        if(threedox.hideAfterScore) {
            $('#hideYes').addClass('gray');
            $('#hideNo').removeClass('gray');
            
        } else {
            $('#hideNo').addClass('gray');
            $('#hideYes').removeClass('gray');
            
        }
        
        mainMenuBox.hide();
        optionsBox.show();
        
    }
    
    function aboutFn(e) {
        e.preventDefault();
        console.log('about clicked');
        
        mainMenuBox.hide();
        aboutBox.show();
        
    }
    
    function returnBtnFn() {
        aboutBox.hide();
        optionsBox.hide();
        choiceBox.hide();
        
        menuBox.show();
        mainMenuBox.show();
        
    }
    
    function switchMusicFn() {
        var str = $(this).text();
        console.log(str);
        if(str == 'on') {
            soundtrack.play();
            playMusic = true;
            
            $('#musicOn').addClass('gray');
            $('#musicOff').removeClass('gray');
            
        } else {
            soundtrack.pause();
            playMusic = false;
            
            $('#musicOn').removeClass('gray');
            $('#musicOff').addClass('gray');
            
        }  
    }
    
    function switchHideFn() {
        var str = $(this).text();
         console.log(str);
        
        if(str == 'yes') {
            threedox.hideAfterScore = true;
            
            $('#hideYes').addClass('gray');
            $('#hideNo').removeClass('gray');
            
        } else {
          threedox.hideAfterScore = false;
          
           $('#hideNo').addClass('gray');
           $('#hideYes').removeClass('gray');
            
        } 
    }
    
    function volRangeChange() {
        console.log('Music volume: '+ $(this).val());
        soundtrack.volume = $(this).val()/100;
    }
    
    
    
});

