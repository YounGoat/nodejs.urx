'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    , htp = require('htp')
    , PoC = require('jinang/PoC')
    , shadowing = require('shadowing')
    
    /* in-package */

    /* in-file */
    ;

function examine(options, callback) { return PoC(function(done) {
    if (typeof options == 'string') {
        options = { url : options };
    }
    options = Object.assign({
        request: {
            headers: {},
        },
        response: {
            statusCode: shadowing.numberRange('>=200 <400'),
            headers: {},
        },
    }, options);

    let urlname = options.url;
    let headers = options.request.headers;
    htp.get(urlname, headers, (err, response) => {
        if (err) {
            return done(err);
        }
        
        if (!shadowing(response, options.response)) {
            return done(new Error(`unexpected response`), { response });
        }
        
        return done(null, { response });
    });
}, callback); }; 

module.exports = examine;