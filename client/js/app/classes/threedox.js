/**
*	@name threedox.js 
*	@author DH
*
*/

/**
* @Class Threedox
* 	Zawiera zestaw funkcji i zmiennych publicznych, i prywatnych, 
*	które niezbêdne s¹ do obslu¿enia gry po stronie klienta. 
*
*/
function Threedox(socket) {
	var that = this;
	
    this.socket  = socket;
    
    //private
    var gamerSign = null;
    var gamerNumber = null;
    var endGame = false;
    var whoTurn = 'player1';
	var gameStarted = false;
	
	this.spheres = [];
	this.oColor = 0x0000ff;
	this.xColor = 0xff0000;
	var field = [];
	
	var score = {
		player1: 0,
		player2: 0,
		recent: null
	}
	
	this.scene = null;
	
    this.update = function(flag) {
		this.socket.emit('update', flag);
		this.socket.on('updated', function(data) {
			console.log(data);
			
			gamerSign = data.gamerSign;
			gameStarted = data.gameStarted;
			gamerNumber = data.gamerNumber;
			whoTurn = data.whoTurn;
			field = data.field;
			
			that.recolorSpheres(data.field);
			score = data.score;
			
			var signs = {gamerSign: gamerSign, oppSign: (gamerSign === 'o')? 'x':'o'};
			that.updateBoxes(data.score, data.playersNames, signs);
			
			that.changeTurnAnimation( data.whoTurn );
			
			that.checkWhoWins(data.score.whoWon, data.score.draw);
		});
    }
	
	this.onDraw = null;
	this.onWin = null;
	this.onLose = null;
	
	this.checkWhoWins = function(whoWon, draw) {
		if(this.onDraw === null || this.onWin === null || this.onLose === null) {
			console.log('Zdefiniuj Threedox.onDraw, Threedox.onWin i Threedox.onLose!');
			return;
		}
		
		if(draw) {
			this.deletePlayers();
			this.onDraw();
		} else if (whoWon === ('player'+gamerNumber)) {
			this.deletePlayers();
			this.onWin();
		} else if (whoWon !== null && whoWon !== ('player'+gamerNumber)) {
			this.deletePlayers();
			this.onLose();
		}
		
	}
	
	this.deletePlayers = function()  {
		this.socket.emit('deletePlayers');
		
	}
  
    this.getGamerSign = function() {
        return gamerSign;
    }
  
    this.getGamerNumber = function() {
        return gamerNumber;
    }
	
	this.getGameStarted = function() {
        return gameStarted;
    }
	
	this.getWhoTurn = function() {
		return whoTurn;
	}
	
	this.getScore = function() {
		return score;
	}
	
	this.changeTurn = function() {
		this.socket.emit('changeTurn');	
	}
	
	this.getRecentScore = function() {
		return score.recent;
	}
	
	this.fillFieldCell = function(i, j, k) {
		if(whoTurn === 'player'+gamerNumber) {
			//console.log('fillField... ' + gamerSign +" "+this.getGamerSign());
			this.socket.emit('fillFieldCell', { gamerSign: gamerSign, i: i, j: j, k: k });	
		} else {
			console.log("Ktos tu chce oszukiwaæ, nie ladnie.");
		}
	}
	
	this.getField = function() {
		return field;
	}
	
	this.hideAfterScore = true;
	
	this.recolorSpheres = function(field) {
		if(field.length > 0) {
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				for(var k = 0; k < 3; k++) {
					var sign = field[i][j][k];
					if(sign === 'o') {
						this.spheres[i][j][k].material.color.setHex( oColor );
						
					} else if (sign === 'x') {
						this.spheres[i][j][k].material.color.setHex( xColor );
						
					} else if (/n/.test(sign)) {
						
						if(this.hideAfterScore) {
							this.scene.remove(this.spheres[i][j][k]);
							this.spheres[i][j][k].visible = false;
						}
						
						this.spheres[i][j][k].scale.set(0.5, 0.5, 0.5);
						
						if(sign.slice(1) === 'o') 
							this.spheres[i][j][k].material.color.setHex( oColor )
						else if(sign.slice(1) === 'x')
							this.spheres[i][j][k].material.color.setHex( xColor );
					}
					//this.spheres[i][j][k].material.color.setHex( eval( 'this.' + sign + 'Color' ) );
					
				}	
			}	
		}
		}
	}
	
	this.setDef = function() {
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				for(var k = 0; k < 3; k++) {
					this.scene.add(this.spheres[i][j][k]);
					this.spheres[i][j][k].visible = true;
					this.spheres[i][j][k].scale.set(1, 1, 1);
					this.spheres[i][j][k].material.color.setHex( 0xffffff );
				}
			}
		}
		
		field = [];
		gamerSign = null;
		gamerNumber = null;
		endGame = false;
		whoTurn = 'player1';
		gameStarted = false;
		
		score = {
			player1: 0,
			player2: 0,
			recent: null
		}
	}
	
	this.boxes = {
		yourName: null,
		yourScore: null,
		oppScore: null,
		oppName: null,
		oppSignSpan: null,
		yourSignSpan: null,
		rightInfo: null,
		leftInfo: null
	}
	
	var decimalToHex = function(d, padding) {
		var hex = Number(d).toString(16);
			padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return hex;
	}
	
	this.updateBoxes = function(score, names, signs) {
		var can = true;
		for(var box in this.boxes) {
			if(this.boxes[box] === null) can = false;
		}
		
		if(can) {
			this.boxes['yourScore'].text( score['player'+gamerNumber] );
			var friendNumber = (gamerNumber === 1)? 2 : 1;
			this.boxes['oppScore'].text( score['player'+friendNumber] );
			this.boxes['yourName'].text( names['player'+gamerNumber] );
			this.boxes['oppName'].text( names['player'+friendNumber] );
			
			this.boxes['oppSignSpan'].text( signs.oppSign );
			this.boxes['oppSignSpan'].css( { "color": "#"+decimalToHex(this[signs.oppSign+'Color'], 6), "font-weight": "bold" } );
			
			this.boxes['yourSignSpan'].text( signs.gamerSign );
			this.boxes['yourSignSpan'].css( { "color": "#"+decimalToHex(this[signs.gamerSign+'Color'], 6), "font-weight": "bold" } );
		} else {
			console.log('Nie przypisano boxów - maj¹ wartoœæ null');
		}
	}
	
	this.changeTurnAnimation = function(whoTurn) {
		var client = 'player'+gamerNumber;
		
		if(this.boxes.rightInfo !== null && this.boxes.leftInfo !== null) {
			if(client === whoTurn) {
				
				this.boxes.rightInfo.animate({
					opacity: 0.5,
					fontSize: '16px'
				}, 100);
        
				this.boxes.leftInfo.animate({
					opacity: 1,
					fontSize: '20px'
				}, 100);
		
			} else {
				
				this.boxes.leftInfo.animate({
					opacity: 0.5,
					fontSize: '16px'
				}, 100);
        
				this.boxes.rightInfo.animate({
					opacity: 1,
					fontSize: '20px'
				}, 100);
				
			}
		} else {
			console.log('Nie przypisano boxów - maj¹ wartoœæ null');
		}
		
	}
  
}