var Filter = require('../index.js')
	, data =require('./dataSet.json')
	;

var columns = data.columns;
var strings = data.strings;
var dataSet = data.data;

//do one without timing it so that the code gets compiled
Filter.with(dataSet).equals(getRandomValue(columns), getRandomValue(strings)).select();

var targetColumn = getRandomValue(columns);
var targetValue = getRandomValue(strings);

var start, end, iterations = 1000;

start = +new Date();

var filter = Filter.create().equals(targetColumn, targetValue)

for (var x = 0; x < iterations; x++) {
	results = filter.using(dataSet).select();
}
end = +new Date();

console.log("filter \t\t: duration %sms, %d filters/sec, %d ms/filter"
	, end - start, Math.round((iterations / (end - start)) * 1000)
	, Math.round(((end - start) / iterations) * 100) / 100
);

console.time("filtering with a for loop");
start = +new Date();
for (var y = 0; y < iterations; y++) {
	var results = [];
	for (var x = 0; x < dataSet.length; x++) {
		if (dataSet[x][targetColumn] == targetValue) {
			results.push(dataSet[x]);
		}
	}
}
end = +new Date();

console.log("filter target \t: duration %sms, %d filters/sec, %d ms/filter"
	, end - start, Math.round((iterations / (end - start)) * 1000)
	, Math.round(((end - start) / iterations) * 100) / 100
);


function getRandomValue(ary) {
	return ary[Math.floor(Math.random() * ary.length)];
}