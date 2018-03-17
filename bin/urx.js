#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	, cloneObject = require('jinang/cloneObject')
	, co = require('jinang/co')
	, colors = require('colors')
	, commandos = require('commandos')
	, htp = require('htp')
	, noda = require('noda')
	, TxtFile = require('jinang/TxtFile')
	
	/* in-package */
	, urx = noda.inRequire('index')

	/* in-file */
	, clearObject = obj => { for (let name in obj) delete obj[name]; }
	, makeChainProperty = (obj, chainName, value) => {
		let names = chainName.split('.');
		let endname = names.pop();
		let o = obj;
		for (let i = 0, name; i < names.length; i++) {
			name = names[i];
			if (!o.hasOwnProperty(name)) o[name] = {};
			o = o[name];
		}
		o[endname] = value;
	}
	;

const help = () => console.log(noda.inRead('help.txt', 'utf8'));

const cmd = commandos.parse({
	explicit: true,
    groups: [
        [ '--help -h REQUIRED' ],
        [ '--file -f [0] NOT NULL REQUIRED' ],
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

	// ^.IGNORE
	function IGNORE(line, registry) {
		let matched = /^\^\.((IGNORE)(\.(START|END))?)\s*$/i.test(line);
		if (matched) {
			let command = RegExp.$2.toUpperCase();
			let action = RegExp.$4.toUpperCase();
			if (command == 'IGNORE') {
				registry.ignore = (action == 'END') ? false : true;
			}
		}
		return matched;
	},

	// ^.REQUEST
	// ^.RESPONSE
	function config(line, registry) {
		let matched = /^\^\.((REQUEST|RESPONSE)(\.[^\s]+)?)\s+(.+)$/.test(line);
		if (matched) {
			let name = RegExp.$2.toLowerCase() + RegExp.$3;
			let data = RegExp.$4;
			let json = JSON.parse(data);
			makeChainProperty(registry, name, json);
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
			let options = cloneObject(registry, [ 'request', 'response' ], true);

			options.url = line;
			urx(options, (err, ret) => {
				let msg = ret && ret.response ? ret.response.statusCode : err.message;
				let flag = err ? colors.bold.red('\u00d7') : colors.bold.green('\u221a');
				console.log(flag, colors.italic(line), colors.dim(`[${msg}]`));
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
	}).catch(ex => console.log(ex));
}