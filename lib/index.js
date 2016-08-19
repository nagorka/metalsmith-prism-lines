var Prism = require('prismjs');
var domino = require('domino');
var fs = require('fs');
var vm = require('vm');

module.exports = function() {

	return function(files, metalsmith, done) {

	    var path = require.resolve('prismjs/plugins/line-numbers/prism-line-numbers');
	    var code = fs.readFileSync(path, 'utf8').toString();
		var document = domino.createWindow('<div></div>').document;

		var ctx = {
	      	self: {
		      	Prism: Prism,
		      	document: document	
	      	},
	      	Prism: Prism,
	      	document: null,
	      	console: console
	    };

	    vm.runInNewContext(code, ctx);

		Object.keys(files).forEach(function(path) {

			var contents = files[path].contents.toString();
			var document = domino.createWindow('<div id="prism-html">' + contents + '</div>').document;

			ctx.document = document;

			var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

			for (var i=0, element; element = elements[i++];) {

				element.className = (element.className + ' line-numbers').replace(/^\s+/, '');

				Prism.highlightElement(element, false);

			}

			var html = document.querySelector('#prism-html').innerHTML;

			files[path].contents = new Buffer(html);

		});

		done();
	};

}