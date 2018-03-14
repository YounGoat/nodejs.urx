#!/usr/bin/env node

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	, co = require('jinang/co')
	, colors = require('colors')
	, commandos = require('commandos')
	, htp = require('htp')
	, noda = require('noda')
	, TxtFile = require('jinang/TxtFile')
	
	/* in-package */
	, urx = noda.inRequire('index')
	;

const help = () => console.log(noda.inRead('help.txt', 'utf8'));

const cmd = commandos.parse({
	explicit: true,
    groups: [
        [ '--help -h REQUIRED' ],
        [ '--file -f [0] NOT NULL REQUIRED' ],
	],
	catcher: ex => {
		//
	},
});

// In order of priority.
const lineProcessors = [

	// # title
	function title(line) {
		let matched = line.startsWith('#');
		if (matched) {
			let title = line.replace(/^#+\s*/, '');
			console.log(colors.cyan.bold(title));
		}
		return matched;
	},

	// http://
	// https://
	function http(line) {
		let matched = line.startsWith('http://') || line.startsWith('https://');
		return !matched ? false : new Promise(resolve => {
			urx(line, (err, ret) => {
				let msg = ret && ret.response ? ret.response.statusCode : err.message;
				let flag = err ? colors.bold.red('\u00d7') : colors.bold.green('\u221a');
				console.log(flag, colors.italic(line), colors.dim(`[${msg}]`));
				resolve(true);
			});
		});
	},

	// ...
	function(line) {
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
		let line;
		while ((line = md.nextLine()) !== null) {
			for (let i = 0, matched = false; !matched && i < lineProcessors.length; i++) {
				matched = yield lineProcessors[i](line);
			}
		}
	});	
}