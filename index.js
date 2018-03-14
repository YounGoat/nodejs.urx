'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    , htp = require('htp')
    , PoC = require('jinang/PoC')
    
    /* in-package */
    ;

function examine(urlname, callback) { return PoC(function(done) {
    htp.get(urlname, (err, response) => {
        if (err) {
            done(err);
        }
        else if (response.statusCode < 200 || response.statusCode >= 400) {
            done(new Error(`unexpected status: ${response.statusCode}`), { response });
        }
        else {
            done(null, { response });
        }
    });
}, callback); }; 

module.exports = examine;