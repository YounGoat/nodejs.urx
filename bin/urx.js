#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	, cloneObject = require('jinang/cloneObject')
	, co = require('jinang/co')
	, inof = require('jinang/inof')
	, shorten = require('jinang/shorten')
	, sogo = require('jinang/sogo')
	, TxtFile = require('jinang/TxtFile')

	, colors = require('colors')
	, commandos = require('commandos')
	, htp = require('htp')
	, noda = require('noda')
	
	/* in-package */
	, urx = noda.inRequire('index')

	/* in-file */
	, clearObject = obj => { for (let name in obj) delete obj[name]; }
	;

const help = () => console.log(noda.inRead('help.txt', 'utf8'));

const cmd = commandos.parse({
	explicit: true,
    groups: [
        [ '--help -h REQUIRED' ],
        [ 
			'--file -f [0] NOT NULL REQUIRED',
			'--verbose -v',
			'--longurl NOT NULL',
		],
	],
	catcher: ex => {
		// ...
	},
});

// In order of priority.
const lineProcessors = [

	// # title
	function title(line, registry) {
		let matched = line.startsWith('#');
		if (matched) {
			let title = line.replace(/^#+\s*/, '');
			console.log(colors.cyan.bold(title));
		}
		return matched;
	},

	// <!-- ... -->
	function comment(line, registry) {
		let matched = /^<!--.+-->$/.test(line);
		return matched;
	},

	// ///
	function comment(line, registry) {
		let matched = /^\/{3}/.test(line);
		return matched;
	},

	// ^.GROUP
	// ^.IGNORE
	function command(line, registry) {
		let matched = /^\^\.((GROUP|IGNORE)(\.(START|END))?)\s*$/i.test(line);
		if (matched) {
			let command = RegExp.$2.toUpperCase();
			let action = RegExp.$4.toUpperCase();
			switch (command) {
				case 'GROUP':
					registry.group = (action == 'END') ? false : true;
					// On GROUP.END, delete the REQUEST and RESPONSE settings.
					if (!registry.group) {
						delete registry.request;
						delete registry.response;
					}
					break;
					
				case 'IGNORE':
					registry.ignore = (action == 'END') ? false : true;
					break;
			}
		}
		return matched;
	},

	// function configResponseSize(line, registry) {
	// 	let matched = /^\^\.RESPONSE.bodyBuffer.length\s+(.+)$/.test(line);
	// 	if (matched) {
	// 		let data = RegExp.$1;
	// 		sogo.set(registry, 'response.bodyBuffer.length', shadowing.numberRange(data));
	// 	}
	// 	return matched;
	// },

	// ^.REQUEST
	// ^.RESPONSE
	function config(line, registry) {
		let matched = /^\^\.((REQUEST|RESPONSE)(\.[^\s]+)?)\s+(.+)$/.test(line);
		if (matched) {
			// REQUEST | RESPONSE
			let name = RegExp.$2.toLowerCase() + RegExp.$3;

			let data = RegExp.$4;
			let json = JSON.parse(data);
			sogo.set(registry, name, json);
		}
		return matched;
	},

	// http://
	// https://
	function http(line, registry) {
		line = line.trim();
		let matched = line.startsWith('http://') || line.startsWith('https://');
		if (!matched) {
			return false;
		}
		if (registry.ignore) {
			console.log(colors.bold.gray('*'), colors.italic(line));
			return true;
		}
		return new Promise(resolve => {
			if (registry.ignore) {
				resolve(true);
				return;
			}

			// The last argument `true` indicates to remove cloned properties 
			// from the original object `registry`.
			let options = cloneObject(registry, [ 'request', 'response' ], !registry.group);

			options.url = line;

			if (cmd.verbose) {
				let headers = sogo.get(options, 'request.headers');
				headers && inof(headers, (name, value) => {
					console.log(colors.yellow('>'), colors.dim(name) + ':', value)
				});
			}

			urx(options, (err, ret) => {
				let response = ret && ret.response;
				let msg = response 
					? `HTTP/${response.httpVersion} ${response.statusCode} ${response.bodyBuffer.length}B`
					: err.message
					;
				let deco = err ? colors.red : colors.green;
				let flag = deco.bold(err ? '\u00d7' : '\u221a');

				if (cmd.verbose && response) {
					inof(response.headers, (name, value) => {
						console.log(deco('<'), colors.dim(name) + ':', value);
					});
				}
				
				let urlname = options.url;
				if (cmd.longurl) {
					urlname = shorten(urlname, 80, cmd.longurl);
				}

				console.log(flag, colors.italic(urlname), colors.dim(`[${msg}]`));
				resolve(true);
			});
		});
	},

	// ...
	function(line, registry) {
		console.log(line);
		return true;
	}
];

if (!cmd) {
	return help();
}
else if (cmd.help) {
	return help();
}
else {
	if (!fs.existsSync(cmd.file)) {
		console.error(`file not found: ${cmd.file}`);
		return;
	}
	let md = new TxtFile(cmd.file);

	co.easy(function*() {
		let line, registry = {};
		while ((line = md.nextLine()) !== null) {
			for (let i = 0, matched = false, ret; !matched && i < lineProcessors.length; i++) {
				ret = yield lineProcessors[i](line, registry);
				if (typeof ret == 'boolean') matched = ret;
				else if (typeof ret == 'string') line = ret;
				else throw new Error(`unexpected processor response: ${ret}`);
			}
		}
	}).catch(ex => {
		console.log(cmd.verbose ? ex : ex.message);
	});
}