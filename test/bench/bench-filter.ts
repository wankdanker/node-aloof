let Filter = require('../../')
	, data =require('./dataSet.json')
	;

let columns = data.columns;
let strings = data.strings;
let dataSet = data.data;

//do one without timing it so that the code gets compiled
Filter.with(dataSet).equals(getRandomValue(columns), getRandomValue(strings)).select();

let targetColumn = "aQswGRQRTW" //getRandomValue(columns);
let targetValue = "eSqGxj1SlO" //getRandomValue(strings);

let start, end, iterations = 10000;

start = +new Date();
for (let x = 0; x < iterations; x++) {
	const results = Filter.with(dataSet).equals(targetColumn, targetValue).select();
}
end = +new Date();

console.log("aloof:bench-filter filter \t\t: duration %sms, %d filters/sec, %d ms/filter"
	, end - start, Math.round((iterations / (end - start)) * 1000)
	, Math.round(((end - start) / iterations) * 100) / 100
);

start = +new Date();
for (let y = 0; y < iterations; y++) {
	let results: any[] = [];
	for (let x = 0; x < dataSet.length; x++) {
		if (dataSet[x][targetColumn] == targetValue) {
			results.push(dataSet[x]);
		}
	}
}
end = +new Date();

console.log("aloof:bench-filter filter target \t: duration %sms, %d filters/sec, %d ms/filter"
	, end - start, Math.round((iterations / (end - start)) * 1000)
	, Math.round(((end - start) / iterations) * 100) / 100
);

function getRandomValue(ary) {
	return ary[Math.floor(Math.random() * ary.length)];
}
