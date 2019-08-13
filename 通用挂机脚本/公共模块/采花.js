var mineArray = [
{
		level : 1,
		name : '苹果薄荷',
		func : (cb)=>{
			cga.travel.falan.toStone('W1', (r)=>{
				cga.walkList([
					[22, 87, '芙蕾雅'],
					[500, 85],
				], cb);
			});
		}		
	},
	{
		level : 2,
		name : '柠檬草',
		func : (cb)=>{
			cga.travel.falan.toStone('W1', (r)=>{
				cga.walkList([
					[22, 87, '芙蕾雅'],
					[515, 100],
				], cb);
			});
		}		
	},
	{
		level : 3,
		name : '蝴蝶花',
		func : (cb)=>{
			cga.travel.falan.toStone('W1', (r)=>{
				cga.walkList([
					[22, 87, '芙蕾雅'],
					[505, 120],
				], cb);
			});
		}		
	},
	{
		level : 4,
		name : '果梨',
		func : (cb)=>{
			cga.travel.falan.toStone('W1', (r)=>{
				cga.walkList([
					[22, 87, '芙蕾雅'],
					[510, 130],
				], cb);
			});
		}		
	},
	{
		level : 5,
		name : '桃木',
		func : (cb)=>{
			cga.travel.falan.toStone('W1', (r)=>{
				cga.walkList([
					[22, 87, '芙蕾雅'],
					[521, 126],
				], cb);
			});
		}		
	},
	{
		level : 6,
		name : '番红花',
		func : (cb)=>{
			cga.travel.falan.toStone('W1', (r)=>{
				cga.walkList([
					[22, 87, '芙蕾雅'],
					[503, 132],
				], cb);
			});
		}		
	},
	{
		level : 7,
		name : '百里香',
		func : (cb)=>{
			cga.travel.falan.toTeleRoom('杰诺瓦镇', ()=>{
				cga.walkList([
					[14, 6, '村长的家'],
					[1, 9, '杰诺瓦镇'],
					[71, 19, '莎莲娜'],
					[267, 561],
				], cb);
			});
		}
	},
	{
		level : 8,
		name : '瞿麦',
		func : (cb)=>{
			cga.travel.falan.toTeleRoom('杰诺瓦镇', ()=>{
				cga.walkList([
					[14, 6, '村长的家'],
					[1, 9, '杰诺瓦镇'],
					[71, 19, '莎莲娜'],
					[262, 574],
				], cb);
			});
		}
	},
	{
		level : 9,
		name : '茴香',
		func : (cb)=>{
			cga.travel.falan.toTeleRoom('杰诺瓦镇', ()=>{
				cga.walkList([
					[14, 6, '村长的家'],
					[1, 9, '杰诺瓦镇'],
					[24, 39, '莎莲娜'],
					[178, 510],
				], cb);
			});
		}
	},
	{
		level : 10,
		name : '七叶树',
		func : (cb)=>{
			cga.travel.falan.toTeleRoom('杰诺瓦镇', ()=>{
				cga.walkList([
					[14, 6, '村长的家'],
					[1, 9, '杰诺瓦镇'],
					[71, 18, '莎莲娜'],
					[329, 455],
				], cb);
			});
		}
	},
	{
		level : 8,
		name : '赛希尔叶',
		display_name : '赛希尔叶阿凯鲁法村',
		func : (cb)=>{
			if(cga.GetMapName() != '阿凯鲁法村')
				throw new Error('必须从阿凯鲁法村启动');
			
			cga.walkList([
				[178, 227, '米内葛尔岛'],
				[293, 314],
			], cb);
		}
	},
];

var cga = global.cga;
var configTable = global.configTable;

var thisobj = {
	func : (cb) =>{
		thisobj.object.func(cb);
	},
	check_done : ()=>{
		return cga.getInventoryItems().length >= 20
	},
	translate : (pair)=>{
		if(pair.field == 'mineObject'){
			pair.field = '要伐的木';
			pair.value = mineArray[pair.value].name;
			pair.translated = true;
			return true;
		}
		return false;
	},
	loadconfig : (obj)=>{
		for(var i in mineArray){
			if(i == obj.mineObject){
				configTable.mineObject = i;
				thisobj.object = mineArray[i];
				break;
			}
		}
		
		if(!thisobj.object){
			console.error('读取配置：要伐的木失败！');
			return false;
		}
				
		return true;
	},
	inputcb : (cb)=>{
		var sayString = '【采集插件】请选择要采的花:';
		for(var i in mineArray){
			if(i != 0)
				sayString += ', ';
			sayString += '('+ (parseInt(i)+1) + ')' + (typeof mineArray[i].display_name == 'string' ? mineArray[i].display_name : mineArray[i].name);
		}
		cga.sayLongWords(sayString, 0, 3, 1);
		cga.waitForChatInput((msg, index)=>{
			if(index !== null && index >= 1 && mineArray[index - 1]){
				configTable.mineObject = index - 1;
				thisobj.object = mineArray[index - 1];
				
				var sayString2 = '当前已选择:[' + (typeof thisobj.object.display_name == 'string' ? thisobj.object.display_name : thisobj.object.name) + ']。';
				cga.sayLongWords(sayString2, 0, 3, 1);
				
				cb(null);
				
				return false;
			}
			
			return true;
		});
	}	
}

module.exports = thisobj;