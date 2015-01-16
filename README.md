node-readlines
==============
Reading file line by line may seem like a trivial problem, but in node, there is no straightforward way to do it. There are a lot of libraries using Transform Streams to achieve it, but it seems like a overkill, so I've wrote simple version using only the `filesystem` module of node.

Install with
`npm install n-readlines`

Usage
==
```javascript
var readLines = require('n-readlines');
var liner = new readLines('filename.txt');
console.log(liner.next());
```
