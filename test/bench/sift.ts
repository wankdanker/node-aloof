// Benchmark comparing sift.js vs direct for loop
import sift from 'sift';
import fs from 'fs'

// Load data
const data = require('./dataSet.json');
let columns = data.columns;
let strings = data.strings;
let dataSet = data.data;

// Helper functions
function getRandomValue(ary) {
  return ary[Math.floor(Math.random() * ary.length)];
}

// Do one filter without timing to ensure code is compiled
const warmupQuery = {};
warmupQuery[getRandomValue(columns)] = getRandomValue(strings);
dataSet.filter(sift(warmupQuery));

// Set up the test
let targetColumn = "aQswGRQRTW" //getRandomValue(columns);
let targetValue = "eSqGxj1SlO" //getRandomValue(strings);

let start, end, iterations = 10000;

// Test sift.js
start = +new Date();
const siftQuery = {};
siftQuery[targetColumn] = targetValue;

for (let x = 0; x < iterations; x++) {
  const results = dataSet.filter(sift(siftQuery));
}
end = +new Date();

console.log("sift.js \t\t: duration %sms, %d filters/sec, %d ms/filter"
  , end - start, Math.round((iterations / (end - start)) * 1000)
  , Math.round(((end - start) / iterations) * 100) / 100
);

// Test with a direct for loop
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

console.log("sift.js filter target \t: duration %sms, %d filters/sec, %d ms/filter"
  , end - start, Math.round((iterations / (end - start)) * 1000)
  , Math.round(((end - start) / iterations) * 100) / 100
);

// Let's add one more test - using Array.filter directly
start = +new Date();
for (let y = 0; y < iterations; y++) {
  const results = dataSet.filter(item => item[targetColumn] == targetValue);
}
end = +new Date();

console.log("sift.js Array.filter \t: duration %sms, %d filters/sec, %d ms/filter"
  , end - start, Math.round((iterations / (end - start)) * 1000)
  , Math.round(((end - start) / iterations) * 100) / 100
);