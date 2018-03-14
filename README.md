#	urx
__URl eXaminer__

##  Description

Verify the availability of URLs in supplied document. __urx__ will try to request the URLs one by one, and those response successfully with statusCode >= 200 and < 400 will be marked with check sign √ (U+221A) and followed with the statusCode, the others will be marked cross sign × (U+00D7) and followed with statusCode or error message if no response available.

##	ToC

*	[Get Started](#get-started)
*   [API](#api)
*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/nodejs.urx)

##	Get Started

```bash
# Install globally.
npm install -g urx

# Examine URLs in foobar.md.
urx foobar.md
```

##  API

__urx__ also offers API to verify URL in code:

```javascript
const urx = require('urx');

urx(urlname, (err, ret) => {
    if (err) {
        // ...
    }
    else {
        // ...
    }
});
```

*   Promise __urx__(string *urlname*)  
    On-resolved argument will be an object containing only one property `response`.  
    On-rejected argument will be an error.

*   void __urx__(string *urlname*, Function *callback*)  
    Function *callback* will receive one or two arguments.  
    The first represents an error and will be equal to `null` if the URL is available.  
    The second will be absent or be an object containing only one property `response`.  
    ATTENTION: Here is something unusual that __the second argument MAY be present even when the first one is not `null`__ that means the URL is not available.

Refer to [htp](https://www.npmjs.com/package/htp#get-started) to find what `response` is.