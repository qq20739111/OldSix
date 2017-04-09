/*
* 六子冲棋AI引擎
* hi@leilei.name
*/

function OldSix(){

	//1.局面表示

	//棋子表示
	this.piece = {
		"stone": 3, //石头
		"leaf": 7, //树叶
		"nopiece": 0, //无棋子
	};

	//引擎
	this.enginePlayer = "leaf";

	//当前走棋方: "stone"或"leaf"
	this.currentPlayer = "stone";
	this.restPlayer = "leaf";

	//棋盘
	this.board = [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 7, 7, 7, 7, 0, 0,
		0, 0, 7, 0, 0, 7, 0, 0,
		0, 0, 3, 0, 0, 3, 0, 0,
		0, 0, 3, 3, 3, 3, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0
	];

	//棋盘范围
	this.inBoard = [
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 1, 1, 1, 1, 0, 0,
		0, 0, 1, 1, 1, 1, 0, 0,
		0, 0, 1, 1, 1, 1, 0, 0,
		0, 0, 1, 1, 1, 1, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0
	];

	//由棋盘数组下标获得棋子X坐标
	this.getXFromLocation = function(location){
		return (location & 7) - 2;
	};

	//由棋盘数组下标获得棋子Y坐标
	this.getYFromLocation = function(location){
		return (location >> 3) - 2;
	};

	//由棋子X坐标，Y坐标获得棋盘数组下标
	this.getLocationFromXY = function(x, y){
		return (x + 2) + (y + 2 << 3);
	};

	//改变走棋子方
	this.changePlayer = function(){
		this.restPlayer = this.currentPlayer + this.restPlayer;
		this.currentPlayer = this.restPlayer.replace(this.currentPlayer, "");
		this.restPlayer = this.restPlayer.replace(this.currentPlayer, "");
		return this.currentPlayer;
	};

	//根据位置和当前走棋方添加棋子
	this.addPiece = function(location){
		if(this.inBoard[location] == 1){
			this.board[location] = this.piece[this.currentPlayer];
		}
	};

	//在棋盘上拿走一枚棋子的方法
	this.delPiece = function(location){
		this.board[location] = this.piece["nopiece"];
	};

	//2.走法生成

	//根据走法生成走法起点位置(起点位置的棋盘数组下标)
	this.generateMoveFrom = function(move){
		return move & 255;
	};

	//根据走法生成走法目的位置(目的位置的棋盘数组下标)
	this.generateMoveTo = function(move){
		return move >> 8;
	};

	//由起点位置和目的位置合成走法
	this.composeMove = function(locationFrom, locationTo){
		return locationFrom + locationTo * 256;
	};

	//最大生成的走法数
	this.maxGenerateMoveNumber = 32;

	//缓存生成的走法数组
	this.theMoves = [];

	//棋子的走子方向
	this.movesTable = [-8, 8, -1, 1];

	//走法生成函数，产生一个局面的所有走法 
	this.generateAllMoves = function(moves){ //传递一个走法列表数组指针，返回生成的所有走法 
		var i, from, to, genCount;
		var myPiece, pieceFrom, pieceTo;

		//1.走法计数器清零
		genCount = 0;

		//2.获取当前走棋方标记
		myPiece = this.piece[this.currentPlayer];

		//3.遍历棋盘找到当前走棋方棋子
		for(from = 0; from < 64; from++){
			//取得当前位置的棋子
			pieceFrom = this.board[from];

			//3.1.如果找到的不是本方棋子，继续找
			if(pieceFrom != myPiece){
				continue;
			}

			//3.2.如果找到本方棋子，探测四个方向是否可走
			for(i = 0; i < 4; i++){
				to = from + this.movesTable[i]; //目标位置
				if(this.inBoard[to] == 1){ //如果还在棋盘内
					pieceTo = this.board[to]; //获取此位置棋子
					if(pieceTo == this.piece["nopiece"]){ //如果此位置无棋子，此走法可行
						moves[genCount] = this.composeMove(from, to); //保存走法
						genCount++; //计数
					}
				}
			}//end for(i)
		}//end for(from)
		return genCount; //返回生成的走法数
	};

	//能根据走法走一步棋的函数 
	this.makeOneMove = function(move, eatTable){ //传递一个用来保存吃子位置的数组
		var i, genCount, isLegalMove, from, to;
		var step, focus, myPiece, oppPiece, eatCount; //吃子专用
	
		isLegalMove = true; //初始化走法为不合法
		genCount = this.generateAllMoves(this.theMoves); //生成所有走法
		//在所有走法中查找当前走法是否存在
		for(i = 0; i < genCount; i++){
			//如果找到一个走法等于当前走法 
			if(this.theMoves[i] == move){
				isLegalMove = false; //所有走法中有此走法，说明走法合法
				break;
			}
		}
	
		//1.首先判断走法是否合法
		if(isLegalMove == true){
			return false; //返回走棋失败 
		}
	
		//2.分解走法，取得起点位置和目的位置
		from = this.generateMoveFrom(move);
		to = this.generateMoveTo(move);
	
		//3.走一步棋
		this.delPiece(from);
		this.addPiece(to);
	
		//4.检查吃子
		eatCount = 0; //一步有可能同时吃掉两子
		myPiece = this.piece[this.currentPlayer] //由当前走棋方计算当前走棋方棋子
		this.changePlayer();
		oppPiece = this.piece[this.currentPlayer]; //由当前走棋方计算对方棋子
		this.changePlayer();
	
		//检查吃子，从上往下、从下往上、从左往右、从右往左，沿四个方向检查吃子情况
		for(i = 0; i < 4; i++){
	
			step = this.movesTable[i]; //取得步长
		
			//检查是否为第一种吃子情况“○○●_” 所走棋子为序列中的第一个白子
			focus = to + step; //把焦点移到棋子前方第一个位置
			if(this.inBoard[focus] == 1 && this.board[focus] == myPiece){
				focus += step; //把焦点移到棋子前方第二个位置
				if(this.inBoard[focus] == 1 && this.board[focus] == oppPiece){
					focus += step; //把焦点移到棋子前方第三个位置
					if(this.inBoard[focus] == 1 && this.board[focus] == this.piece["nopiece"]){
						focus -= step; //把焦点移到吃子位置
						this.delPiece(focus); //吃子
						eatTable[eatCount] = focus; //记录吃子的位置
						eatCount++; //计数
					}
				}
			}
		
			//检查是否为第二种吃子情况“○○●_” 所走棋子为序列中的第二个白子
			focus = to - step; //把焦点移到棋子后方位置
			if(this.inBoard[focus] == 1 && this.board[focus] == myPiece){
				focus = to + step; //把焦点移到棋子前方第一个位置
				if(this.inBoard[focus] == 1 && this.board[focus] == oppPiece){
					focus += step; //把焦点移到棋子前方第二个位置
					if(this.inBoard[focus] == 1 && this.board[focus] == this.piece["nopiece"]){
						focus -= step; //把焦点移到吃子位置
						this.delPiece(focus); //吃子
						eatTable[eatCount] = focus; //记录吃子的位置
						eatCount++; //计数
					}
				}
			}
		
			//检查是否为第三种吃子情况“●○○_” 所走棋子为序列中的第二个白子
			focus = to - step; //把焦点移到棋子后方位置
			if(this.inBoard[focus] && this.board[focus] == oppPiece){
				focus = to + step; //把焦点移到棋子前方第一个位置
				if(this.inBoard[focus] && this.board[focus] == myPiece){
					focus += step; //把焦点移到棋子前方第二个位置
					if(this.inBoard[focus] && this.board[focus] == this.piece["nopiece"]){
					focus = to - step; //把焦点移到吃子位置
					this.delPiece(focus); //吃子
					eatTable[eatCount] = focus; //记录吃子的位置
					eatCount++; //计数
					}
				}
			}
		
			//检查是否为第四种吃子情况“_○○●” 所走棋子为序列中的第二个白子
			focus = to - step; //把焦点移到棋子后方位置
			if(this.inBoard[focus] == 1 && this.board[focus] == this.piece["nopiece"]){
				focus = to + step; //把焦点移到棋子前方第一个位置
				if(this.inBoard[focus] == 1 && this.board[focus] == myPiece){
					focus += step; //把焦点移到棋子前方第二个位置
					if(this.inBoard[focus] == 1 && this.board[focus] == oppPiece){
						focus = focus; //焦点已经在吃子位置
						this.delPiece(focus); //吃子
						eatTable[eatCount] = focus; //记录吃子的位置
						eatCount++; //计数
					}
				}
			}
		
		}
	
		//5.交换走棋方
		this.changePlayer();
	
		return true; //返回走棋成功
	};

	//玩家走棋方法
	this.movePiece = function(fromX, fromY, toX, toY){
		var locationFrom, locationTo, move;
		var eatTable = [];

		locationFrom = this.getLocationFromXY(fromX, fromY);
		locationTo = this.getLocationFromXY(toX, toY);
		move = this.composeMove(locationFrom, locationTo);

		if(this.makeOneMove(move, eatTable)){
			return true;
		}else{
			return false;
		}
	}

	//3.局面评估

	//判断是否分出胜负的函数 
	this.isCurrentPlayerDie = function(){

		//如果生成零个走法，则已被困死，将返回true
		if(this.generateAllMoves(this.theMoves) > 0){
			return false;
		}
		return true;
	};


	//局面评估函数 
	this.evaluatePosition = function(){
		var i, stoneValue, leafValue, value;

		//初始化双方的总价值
		stoneValue = leafValue = 0;

		//遍历棋盘，找到棋子
		for(i = 0; i < 64; i++){
			if(this.board[i] == this.piece["stone"]){
				stoneValue += 3;
			}
			if(this.board[i] == this.piece["leaf"]){
				leafValue += 3;
			}
		}

		//计算局面价值
		value = stoneValue - leafValue;

		return value;
	};

	//4.局面搜素

	//搜索深度
	this.searchDepth = 7;

	//设置搜索深度
	this.setSearchDepth = function(depth){
		this.searchDepth = depth;
	};

	//设置难度
	this.setIQLevel = function(level){
		if(level < 2){
			level = 2;
		}
		if(level > 8){
			level = 8;
		}
		level = Math.round(level);
		this.setSearchDepth(level);
	};

	//定义无穷大
	this.infinityValue = 100;

	//最佳走法
	this.bestMove = 0;

	//当前搜索深度
	this.theDepth = 0;

	//撤销一步棋的方法
	this.undoOneMove = function(move, eatCount, eatTable){
		var i, from, to;

		from = this.generateMoveFrom(move);
		to = this.generateMoveTo(move);

		//还原被吃的子
		for(i = 0; i < eatCount; i++){
			this.addPiece(eatTable[i]); //添加对方棋子(注意，这时走棋方为对方，添加对方棋子)
		}

		this.changePlayer(); //交换走棋方
		this.delPiece(to);   //删除棋子
		this.addPiece(from); //添加己方棋子

	};

	//极小值极大值搜索函数
	this.MinMaxSearch = function(depth){ //depth是搜索博弈树的深度，就相当于能看到将来的多少步棋。 
										 //因为随着深度的增加，博弈树的节点树呈指数级增长，数据相
										 //当庞大，所以深度不易太深，一般7层以上PC机算起来就很吃力了。
		var i, genCount, value, bestValue;
		var allMoves = [];
		var eatCount, eatTable = []; //还原局面时用

		//如果搜索到指定深度，则返回局面评估值
		if(depth == 0){
			return this.evaluatePosition() + (Math.floor(Math.random() * 7 - 3)); //随机因子(-3到3)
		}

		//初始化最佳值
		if(this.currentPlayer == this.enginePlayer){
			bestValue = this.infinityValue; //正无穷
		}else{
			bestValue = -this.infinityValue; //负无穷
		}

		genCount = this.generateAllMoves(allMoves);

		for(i = 0; i < genCount; i++){
			if(this.makeOneMove(allMoves[i], eatTable)){ //如果走棋成功
				this.theDepth++;
				value = this.MinMaxSearch(depth - 1); //递归
				this.undoOneMove(allMoves[i], eatTable.length, eatTable); //还原
				this.theDepth--;
				if(this.currentPlayer == this.enginePlayer){ //如果当前走棋方是引擎，找一个评分最小的局面(对引擎最有利) 
					if(value < bestValue){
						bestValue = value;
						if(depth == this.searchDepth){ //如果是根节点 保存最佳走法 
							this.bestMove = allMoves[i];
						}
					}
				}else{ //如果当前走棋方是玩家，找一个评分最大的局面(对玩家最有利) 
					if(value > bestValue){
						bestValue = value;
						if(depth == this.searchDepth){ //如果是根节点 保存最佳走法 
							this.bestMove = allMoves[i];
						}
					}
				}
			}
		}
	
		//如果是杀棋，就根据距杀棋的步数给出评价
		if(this.currentPlayer == this.enginePlayer){ //如果是引擎
			if(bestValue == this.infinityValue){
				return this.infinityValue - this.theDepth;
			}
		}else{ //是玩家
			if(bestValue == -this.infinityValue){
				return this.theDepth - this.infinityValue;
			}
		}
	
		return bestValue; //返回找到的最佳局面评分
	}

	//让电脑走棋
	this.computerThink = function(){
		var eatTable = [];
		//返回电脑走的棋
		var m = {
			"location": {
				"from": 0,
				"to": 0,
			},
			"coordinate": {
				"from": {
					"x": 0,
					"y": 0,
				},
				"to": {
					"x": 0,
					"y": 0,
				},
			},
		};

		this.theDepth = 0; //距根结点的距离
		this.MinMaxSearch(this.searchDepth);
		this.makeOneMove(this.bestMove, eatTable);

		m.location.from = this.generateMoveFrom(this.bestMove);
		m.location.to = this.generateMoveTo(this.bestMove);
		m.coordinate.from.x = this.getXFromLocation(m.location.from);
		m.coordinate.from.y = this.getYFromLocation(m.location.from);
		m.coordinate.to.x = this.getXFromLocation(m.location.to);
		m.coordinate.to.y = this.getYFromLocation(m.location.to);

		return m; //返回走法
	}

	//让电脑走棋
	this.engineThink = function(){
		return this.computerThink();
	};

}