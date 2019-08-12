var Async = require('async');
var supplyMode = require('./../公共模块/营地回补');
var sellStore = require('./../公共模块/营地卖石');
var sellStore2 = require('./../公共模块/里堡卖石');
var teamMode = require('./../公共模块/组队模式');
var logbackEx = require('./../公共模块/登出防卡住');

var cga = global.cga;
var configTable = global.configTable;
var sellStoreArray = ['不卖石', '卖石'];

var interrupt = require('./../公共模块/interrupt');

var moveThinkInterrupt = new interrupt();
var playerThinkInterrupt = new interrupt();
var playerThinkRunning = false;

var moveThink = (arg)=>{

	if(moveThinkInterrupt.hasInterrupt())
		return false;

	if(arg == 'freqMoveMapChanged')
	{
		playerThinkInterrupt.requestInterrupt();
		return false;
	}

	return true;
}

var playerThink = ()=>{

	if(!cga.isInNormalState())
		return true;
	
	var playerinfo = cga.GetPlayerInfo();
	var ctx = {
		playerinfo : playerinfo,
		petinfo : cga.GetPetInfo(playerinfo.petid),
		teamplayers : cga.getTeamPlayers(),
		result : null,
		dangerlevel : thisobj.getDangerLevel(),
	}

	teamMode.think(ctx);

	global.callSubPlugins('think', ctx);

	if(cga.isTeamLeaderEx() && ctx.dangerlevel > 0)
	{
		if(ctx.result == null && playerThinkInterrupt.hasInterrupt())
			ctx.result = 'supply';

		if(ctx.result == 'supply' && supplyMode.isLogBack())
			ctx.result = 'logback';
		
		if( ctx.result == 'supply' )
		{
			moveThinkInterrupt.requestInterrupt(()=>{
				if(cga.isInNormalState()){
					supplyMode.func(loop);
					return true;
				}
				return false;
			});
			return false;
		}
		else if( ctx.result == 'logback' )
		{
			moveThinkInterrupt.requestInterrupt(()=>{
				if(cga.isInNormalState()){
					logbackEx.func(loop);
					return true;
				}
				return false;
			});
			return false;
		}
	}

	return true;
}

var playerThinkTimer = ()=>{
	if(playerThinkRunning){
		if(!playerThink()){
			console.log('playerThink off');
			playerThinkRunning = false;
		}
	}
	
	setTimeout(playerThinkTimer, 1500);
}

var loop = ()=>{

	var map = cga.GetMapName();
	var mapindex = cga.GetMapIndex().index3;
	
	if(cga.isTeamLeaderEx()){
		if(map == '医院' && mapindex == 44692){
			if(thisobj.sellStore == 1){
				sellStore.func(loop);
			} else {
				cga.walkList([
					[0, 20, '圣骑士营地'],
				], loop);
			}
			return;
		}
		if(map == '工房'){
			cga.walkList([
			[30, 37, '圣骑士营地']
			], loop);
			return;
		}
		if(map == '肯吉罗岛'){
			cga.freqMove(0);
			return;
		}
		if(map == '圣骑士营地' && teamMode.object.is_enough_teammates()){
			console.log('playerThink on');
			playerThinkRunning = true;
			cga.walkList([
				[36, 87, '肯吉罗岛'],
				[467, 201],
			], loop);
			return;
		}
	} else {
		console.log('playerThink on');
		playerThinkRunning = true;
		return;
	}

	if(thisobj.sellStore == 1 && cga.getSellStoneItem().length > 0 && map != '圣骑士营地')
	{
		sellStore2.func(loop);
		return;
	}
	
	if(cga.needSupplyInitial() && supplyMode.isInitialSupply() && map != '圣骑士营地')
	{
		supplyMode.func(loop);
		return;
	}

	callSubPluginsAsync('prepare', ()=>{
		cga.travel.falan.toCamp(()=>{
			cga.walkList([
			cga.isTeamLeader ? [96, 86] : [97, 86],
			], ()=>{
				teamMode.object.wait_for_teammates(loop);
			});
		});
	});
}

var thisobj = {
	getDangerLevel : ()=>{
		var map = cga.GetMapName();
		
		if(map == '肯吉罗岛' )
			return 2;
				
		return 0;
	},
	translate : (pair)=>{
		
		if(pair.field == 'sellStore'){
			pair.field = '是否卖石';
			pair.value = pair.value == 1 ? '卖石' : '不卖石';
			pair.translated = true;
			return true;
		}
		
		if(supplyMode.translate(pair))
			return true;
		
		if(teamMode.translate(pair))
			return true;
		
		return false;
	},
	loadconfig : (obj, cb)=>{

		if(!supplyMode.loadconfig(obj, cb))
			return false;
		
		if(!teamMode.loadconfig(obj, cb))
			return false;
		
		configTable.sellStore = obj.sellStore;
		thisobj.sellStore = obj.sellStore
		
		if(!thisobj.sellStore){
			console.error('读取配置：是否卖石失败！');
			return false;
		}
		
		return true;
	},
	inputcb : (cb)=>{
		Async.series([supplyMode.inputcb, teamMode.inputcb, (cb2)=>{
			var sayString = '【沙滩插件】请选择是否卖石: 0不卖石 1卖石';
			cga.sayLongWords(sayString, 0, 3, 1);
			cga.waitForChatInput((msg, val)=>{
				if(val !== null && val >= 0 && val <= 1){
					configTable.sellStore = val;
					thisobj.sellStore = val;
					
					var sayString2 = '当前已选择:'+sellStoreArray[thisobj.sellStore]+'。';
					cga.sayLongWords(sayString2, 0, 3, 1);
					
					cb2(null);
					
					return true;
				}
				
				return false;
			});
		}], cb);
	},
	execute : ()=>{
		playerThinkTimer();
		cga.registerMoveThink(moveThink);
		callSubPlugins('init');
		logbackEx.init();
		loop();
	},
};

module.exports = thisobj;