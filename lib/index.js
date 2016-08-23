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

		var allHooks = Prism.hooks.all;

		var h = [];
		Object.keys(allHooks).forEach(function(key) {
			allHooks[key].forEach(function(item) {
				h.push({
					key: key,
					hook: item,
					remove: false
				});
			});
		});

		vm.runInNewContext(code, ctx);

		Object.keys(allHooks).forEach(function(key) {
			allHooks[key].forEach(function(item) {
				
				var hook = h.find(function(x) {
					return x.hook === item;
				});

				if (!hook) {
					h.push({
						key: key,
						hook: item,
						remove: true
					});
				}

			});
		});


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

		h.filter(function(x) {
			return x.remove;
		}).forEach(function(x) {
			var i = allHooks[x.key].indexOf(x.hook);
			if (i > -1) {
				allHooks[x.key].splice(i, 1);
				if (!allHooks[x.key].length) {
					delete allHooks[x.key];
				}
			}
		});

		done();
	};

}