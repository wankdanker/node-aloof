import Filter from '../../'

const data = require('./dataSet.json')

let columns = data.columns;
let strings = data.strings;
let dataSet = data.data;

//do one without timing it so that the code gets compiled
Filter.with(dataSet).equals(getRandomValue(columns), getRandomValue(strings)).select();

let targetColumn = getRandomValue(columns);
let targetValue = getRandomValue(strings);

let start, end, iterations = 10000;

start = +new Date();

let filter = Filter.create().equals(targetColumn, targetValue)

for (let x = 0; x < iterations; x++) {
	const results = filter.using(dataSet).select();
}
end = +new Date();

console.log("bench-filter-cached-function filter \t\t: duration %sms, %d filters/sec, %d ms/filter"
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

console.log("bench-filter-cached-function filter target \t: duration %sms, %d filters/sec, %d ms/filter"
	, end - start, Math.round((iterations / (end - start)) * 1000)
	, Math.round(((end - start) / iterations) * 100) / 100
);


function getRandomValue(ary) {
	return ary[Math.floor(Math.random() * ary.length)];
}