/* TODO: We need more tests for:
 * 	between
 * 	betweenEquals
 * 	outside
 * 	outsideEquals
 * 	match
 * 	startsWith
 * 	endsWith
 * 
 * 	the chainging linq like usage of filter
 * 	sorts
 * 	select('column')
 */

var assert = require('assert'),
	filter = require('..');

var testData = [
	{ id : 1, b : 'Something', name : 'Steve',	gender : 'male',	family : 'deer', mosquitoBites : 430, nullableField : null, strNumber : '14', child : { name : 'Dan' }},
	{ id : 2, b : 'Something', name : 'Dave',	gender : 'male',	family : 'wolf', mosquitoBites : 98, nullableField : "asdf", strNumber : '2', child : { name : 'Derek' }},
	{ id : 3, b : 'Something', name : 'Mary',	gender : 'female',	family : 'deer', mosquitoBites : 254, nullableField : "asdf", strNumber : '3', child : { name : 'Domino' }},
	{ id : 4, b : 'Something', name : 'Margaret',	gender : 'female',	family : 'wolf', mosquitoBites : 178, nullableField : "", strNumber : '1', child : { name : 'Darien' }}
];

var tests = {
	"test '=' comparison" : {
		filter :{
			id : {
				comparison : '=',
				value : 1
			}
		},
		result : [testData[0]]
	},
	"test '==' comparison" : {
		filter :{
			id : {
				comparison : '==',
				value : 1
			}
		},
		result : [testData[0]]
	},
	"test '!=' comparison" : {
		filter :{
			id : {
				comparison : '!=',
				value : 1
			}
		},
		result : [testData[1], testData[2], testData[3]]
	},
	"test '!==' comparison" : {
		filter :{
			id : {
				comparison : '!==',
				value : 1
			}
		},
		result : [testData[1], testData[2], testData[3]]
	},
	"test '!==' comparison with type difference" : {
		filter :{
			id : {
				comparison : '!==',
				value : '1'
			}
		},
		result : [testData[0], testData[1], testData[2], testData[3]]
	},
	"test '>' comparison" : {
		filter :{
			id : {
				comparison : '>',
				value : 1
			}
		},
		result : [testData[1], testData[2], testData[3]]
	},
	"test '>=' comparison" : {
		filter :{
			id : {
				comparison : '>=',
				value : 1
			}
		},
		result : [testData[0], testData[1], testData[2], testData[3]]
	},
	"test '<' comparison" : {
		filter :{
			id : {
				comparison : '<',
				value : 4
			}
		},
		result : [testData[0], testData[1], testData[2]]
	},
	"test '<=' comparison" : {
		filter :{
			id : {
				comparison : '<=',
				value : 4
			}
		},
		result : [testData[0], testData[1], testData[2], testData[3]]
	},
	"test 'in' comparison using string" : {
		filter :{
			b : {
				comparison : 'in',
				value : 'xxxxxSomethingxxxxx'
			}
		},
		result : [testData[0], testData[1], testData[2], testData[3]]
	},
	"test 'in' comparison using array" : {
		filter :{
			id : {
				comparison : 'in',
				value : [4, 1]
			}
		},
		result : [testData[0], testData[3]]
	},
	"test 'contains' comparison" : {
		filter :{
			b : {
				comparison : 'contains',
				value : 'om'
			}
		},
		result : [testData[0], testData[1], testData[2], testData[3]]
	},
	"test multiple filter or" : {
		filter:[
			{
				family : {
					comparison : '=',
					value : 'deer'
				}
			},
			// implicit or 
			{
				gender : {
					comparison : '=',
					value : 'male'
				}
			}
		],
		result : [testData[0], testData[1], testData[2]]
	},
	"test multiple filter (or) while one filter contains multiple attributes (and)" : {
		filter:[
			{
				name : {
					comparison : '=',
					value : 'Joe'
				},
				// implicit and 
				family : {
					comparison : '=',
					value : 'deer'
				}
			},
			// implicit or 
			{
				gender : {
					comparison : '=',
					value : 'female'
				}
			}
		],
		result : [testData[2], testData[3]]
	},
	"test id greater than 1 and less than 4" : {
		filter:[
			{
				id : [
					{
						comparison : '>',
						value : 1
					},
					{
						comparison : '<',
						value : 4
					}
				]
			}
		],
		result : [testData[1], testData[2]]
	},
	"with() chaining : grouping test" : {
		fn : function (data) {
			return filter.with(data).group('gender').select();
		},
		result : function (data) {
			var result = [].concat(data);
			
			result.groups = {
				gender : {
					male : [data[0],data[1]],
					female : [data[2],data[3]]
				}
			}
			
			return result;
		}
	},
	"with() chaining : grouping with filter" : {
		fn : function (data) {
			return filter.with(data).equals('id', 1).group('gender').select();
		},
		result : function (data) {
			var result = [data[0]];
			
			result.groups = {
				gender : {
					male : [data[0]]
				}
			}
			
			return result;
		}
	},
	"with() chaining : order by" : {
		fn : function (data) {
			return filter.with(data).sort('-id').select();
		},
		result : [testData[3], testData[2], testData[1], testData[0]]
	},
	"with() chaining : order by with coercion" : {
		fn : function (data) {
			return filter.with(data).sort('strNumber', Number).select();
		},
		result : [testData[3], testData[1], testData[2], testData[0]]
	},
	"with() chaining : multiple order by" : {
		fn : function (data) {
			return filter.with(data).sort('gender').sort('id').select();
		},
		result : [testData[2], testData[3], testData[0], testData[1]]
	},
	"with() chaining : select column" : {
		fn : function (data) {
			return filter.with(data).select('name');
		},
		result : [ 
			{ name : testData[0].name }
			, { name : testData[1].name }
			, { name : testData[2].name }
			, { name : testData[3].name }
		]
	},
	"with() chaining : equals('nullableField', null) " : {
		fn : function (data) {
			return filter.with(data).equals('nullableField', null).select();
		},
		result : [ testData[0] ]
	},
	"with() chaining : notEquals('nullableField', null) " : {
		fn : function (data) {
			return filter.with(data).notEquals('nullableField', null).select();
		},
		result : [ testData[1], testData[2], testData[3] ]
	},
	"with() chaining : equals('nullableField', null).or('') " : {
		fn : function (data) {
			return filter.with(data).equals('nullableField', null).or('').select();
		},
		result : [ testData[0], testData[3] ]
	},
	"with() chaining : starts('name','M') " : {
		fn : function (data) {
			return filter.with(data).starts('name','M').select();
		},
		result : [ testData[2], testData[3] ]
	},
	"with() chaining : starts('name','M').notEquals('family','wolf') " : {
		fn : function (data) {
			return filter.with(data).starts('name','M').notEquals('family','wolf').select();
		},
		result : [ testData[2] ]
	},
	"with() chaining : starts('name','M').equals('b','something').notEquals('family','wolf') " : {
		fn : function (data) {
			return filter.with(data).starts('name','M').equals('b','Something').notEquals('family','wolf').select();
		},
		result : [ testData[2] ]
	},
	"with() chaining : starts('name','M').contains('b','th').notEquals('family','wolf') " : {
		fn : function (data) {
			return filter.with(data).starts('name','M').contains('b','th').notEquals('family','wolf').select();
		},
		result : [ testData[2] ]
	},
	"with() chaining : equals('name','Dave').or().equals('gender','female')" : {
		fn : function (data) {
			return filter.with(data).equals('name','Dave').or().equals('gender','female').select();
		},
		result : [ testData[1], testData[2], testData[3] ]
	},
	"with() chaining : equals('name','Dave').or().equals('gender','female').equals('family', 'wolf')" : {
		fn : function (data) {
			return filter.with(data).equals('name','Dave').or().equals('gender','female').equals('family', 'wolf').select();
		},
		result : [ testData[1], testData[3] ]
	},
	"with() chaining : starts('name','D').notEquals('family', 'wolf')" : {
		fn : function (data) {
			return filter.with(data).starts('name','D').notEquals('family', 'wolf').select();
		},
		result : [ ]
	},
	"with() chaining : greaterThan('id',1).lessThan('id',4)" : {
		fn : function (data) {
			return filter.with(data).greaterThan('id',1).lessThan('id',4).select();
		},
		result : [ testData[1], testData[2] ]
	},
	"with() chaining : equals('id',1).or(2).or(3)" : {
		fn : function (data) {
			return filter.with(data).equals('id',1).or(2).or(3).select();
		},
		result : [ testData[0], testData[1], testData[2] ]
	},
	"with() chaining : test sum()" : {
		fn : function (data) {
			return filter.with(data).sum('id');
		},
		result : 10
	},
	"with() chaining : test max()" : {
		fn : function (data) {
			return filter.with(data).max('mosquitoBites');
		},
		result : 430
	},
	"with() chaining : test min()" : {
		fn : function (data) {
			return filter.with(data).min('mosquitoBites');
		},
		result : 98
	},
	"with() chaining : test avg()" : {
		fn : function (data) {
			return filter.with(data).avg('id');
		},
		result : 2.5
	},
	"with() chaining : test falsy()" : {
		fn : function (data) {
			return filter.with(data).falsy('nullableField').select();
		},
		result : [ testData[0], testData[3] ]
	},
	"with() chaining : test truthy()" : {
		fn : function (data) {
			return filter.with(data).truthy('nullableField').select();
		},
		result : [ testData[1], testData[2] ]
	},
	"with() chaining : test - falsey().greaterThan().or().truthy()" : {
		fn : function (data) {
			return filter.with(data).falsey('nullableField').greaterThan('id',1).or().truthy('nullableField').select();
		},
		result : [ testData[1], testData[2], testData[3] ]
	},
	"with() chaining : test - truthy().or().falsey().greaterThan()" : {
		fn : function (data) {
			return filter.with(data).truthy('nullableField').or().falsey('nullableField').greaterThan('id',1).select();
		},
		result : [ testData[1], testData[2], testData[3] ]
	},
	"with() chaining : test - truthy().or().falsey().greaterThan() - two" : {
		fn : function (data) {
			return filter.with(data).truthy('nullableField').or().falsey('nullableField').greaterThan('id',0).select();
		},
		result : [ testData[0], testData[1], testData[2], testData[3] ]
	},
	"with() chaining : test deep field find " : {
		fn : function (data) {
			return filter.with(data).equals('child.name', 'Dan').select();
		},
		result : [ testData[0] ]
	}
};

var errors = [];

Object.keys(tests).forEach(function (testName) {
	test = tests[testName];
	
	var thisSuccess = true;
	process.stdout.write(testName);
	
	if (test.filter) {
		result = filter(testData, test.filter);
	}
	else if (test.fn) {
		result = test.fn(testData);
	}
	
	try {
		assert.deepEqual(result, (typeof(test.result) == 'function') ? test.result(testData) : test.result, "Failed " + testName)
	}
	catch (e) {
		console.log(e);
		errors.push(e);
		thisSuccess = false;
	}
	
	process.stdout.write(" .... " + ((thisSuccess) ? green("Success") : red("Fail")) + "\n");
});

if (!errors.length) {
	console.log("\nAll tests passed");
}
else {
	console.log("\nSomething failed");
	//console.log(errors);
	process.exit(1);
}

function red(text) {
	return "\033[0;31;40m" + text + "\033[0m"
}

function green(text) {
	return "\033[0;32;40m" + text + "\033[0m"
}