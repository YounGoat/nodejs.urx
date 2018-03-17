#	urx
__URl eXaminer__

##  Description

Verify the availability of URLs in supplied document. __urx__ will try to request the URLs one by one. By default, those responsed successfully with statusCode >= 200 and < 400 will be marked with check sign √ (U+221A) and followed with the statusCode, the others will be marked cross sign × (U+00D7) and followed with statusCode or error message if no response available. You may also customise requesting gestures and define expected responses, see [API](#api) or [Supported Text Formatting](#supported-text-formatting).

##	ToC

*	[Get Started](#get-started)
*   [API](#api)
*   [Supported Text Formatting](#supported-text-formatting)
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

urx(options, (err, ret) => {
    if (err) {
        // ...
    }
    else {
        // ...
    }
});

urx(options)
    .then(function(response) {
        // ...
    })
    .catch(function(ex) {
        // ..
    })
    ;
```

*   Promise __urx__(string *urlname*)
*   Promise __urx__(object *options*)
*   void __urx__(string *urlname*, Function *callback*)
*   void __urx__(object *options*, Function *callback*)

In argument *options*:
*   string __options.url__
*   object __options.request__ OPTIONAL
*   object __options.request.headers__ OPTIONAL//
*   object __options.response__ OPTIONAL
*   number __options.response.statusCode__ OPTIONAL
*   object __options.response.headers__ OPTIONAL

*options.request* is used to customise the request. And *options.response* descibes the expected response.

In promise mode：
*   On-resolved argument will be an object containing only one property `response`.  
*   On-rejected argument will be an error.

In callback mode:
*   Function *callback* will receive one or two arguments.  
*   The first represents an error and will be equal to `null` if the URL is available.  
*   The second will be absent or be an object containing only one property `response`.  
*   Here is something unusual that __the second argument MAY be present even when the first one is not `null`__ that means the URL is not available.

Refer to [htp](https://www.npmjs.com/package/htp#get-started) to find what `response` is.

##  Supported Text Formatting

So far, [Markdown](https://daringfireball.net/projects/markdown/) is the only text format accepted by __urx__:

*   The URLs expected to be examined should occupy an entire line.
*   Lines start with `^.` are indicators for __urx__.

```markdown
<!-- The following URL will be examined. -->
http://www.example.com/

<!-- The next command line tells urx to skip following URLs. -->
^.IGNORE.START
http://1.example.com/
http://2.example.com/
^.IGNORE.END
<!-- Stop skipping. -->

^.RESPONSE.statusCode 302
<!-- The next URL is expected to be responsed with statusCode 302. -->
<!-- This command will be applied on ONLY the first following URL. -->
http://302.example.com/

^.REQUEST.headers { "Host": "www.example.com" }
<!-- The next URL will be sent together with special headers. -->
<!-- This command will be applied on ONLY the first following URL. -->
http://10.0.0.1/
```

Here is [an example of test case written in MarkDown](./example/bat.md) (please read in Raw mode).