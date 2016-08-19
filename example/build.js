var metalsmith = require('metalsmith');
var prism = require('../lib');

metalsmith(__dirname)
	.source('src')
	.use(prism())
	.build(function(err) {
		console.log(err || 'success');
	});