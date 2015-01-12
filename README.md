node-readlines
==============

Read files line by line using node

Install with
`npm install n-readlines`

Usage
==
```javascript
var readLines = require('n-readlines');
var liner = new readLines('filename.txt');
console.log(liner.next());
```
