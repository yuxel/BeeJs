/*jslint white: true, browser: true, devel: true, 
 windows: true, evil: true, onevar: true, undef: true, 
 nomen: true, eqeqeq: true, plusplus: true, bitwise: true, 
 regexp: true, newcap: true, immed: true */

/**
 * XMLHttpRequest handler for BeeJs
 *
 * Usage :
 *     var request = new Bee.Xhr("http://example.com/ajax.php", {
 *         type : "POST", //default is GET
 *         async : true, //when set false, timeout will not work
 *         timeout : 5000, //default is 10000
 *         data : {foo : "bar"},
 *         responseType : "json", //default is text
 *         onSuccess : function(response){
 *             console.log('success');
 *             console.log(response);
 *         },   
 *         onError : function(request, isTimedOut){
 *             console.log('error');
 *             console.log(request);
 *             console.log(isTimedOut);
 *         }    
 *     });
 */ 

var Bee = Bee || {};

(function (Bee) {

    //define variables
    var CrossBrowserXhr, //object holds crossbrowser XMLHttpRequest object  
        getCrossBrowserXhr, //method to get CrossBrowserXhr
        Xhr, // main class
        formatResponse, //function to format response
        mergeObjects, //function to merge objects
        serialize, //serialize an object {foo:'bar'} into foo&bar
        postContentType;

    //get crossbrowser request object 
    getCrossBrowserXhr = function () {
        var xhr = XMLHttpRequest || undefined;
        //if IE
        if (typeof xhr === "undefined") {
            xhr = function () {
                //IE 5 uses Msxml2.XMLHTTP
                var userAgent = navigator.userAgent,
                    greaterThanIE5;

                greaterThanIE5 = userAgent.indexOf("MSIE 5") > -1;
                return new ActiveXObject(
                    greaterThanIE5 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
                );
            };
        }
        if (!xhr) {
            throw "XMLHttpRequest not supported";
        }
        return xhr;
    };


    //merge 2 objects
    //TODO: this should not be in XHR module
    mergeObjects = function (obj1, obj2) {
        var tmp = obj1, 
            attr;

        for (attr in obj2) {
            if (obj2.hasOwnProperty(attr)) {
                tmp[attr] = obj2[attr];
            }
        }
        return tmp;
    };

    //TODO: this should not be in XHR module too
    serialize = function (obj) {
        var serialized = [],
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                //TODO: urlencode value part
                serialized[serialized.length] = key + "=" + obj[key];
            }
        }

        serialized = serialized.join("&");

        return serialized;
    };

    //format response text as text, xml and json
    formatResponse = function (response, responseType) {
        if (responseType === "xml") {
            return response.responseXML;
        }
        else if (responseType === "json") {
            try {
                var data = response.responseText;
                //return eval('(' + data + ')'); 
                return (new Function("return " + data))();
            }
            catch (e) {
                //if an error on eval, return response as text
                return response.responseText;
            }
        }
        else { //text
            return response.responseText;
        }
    };


    //Main XHR class
    Xhr = function (url, options) {
        this.request = undefined;
        
        //default options
        this.defaultOptions = {
            type : "GET",
            async : true,
            responseType : "text",
            data : undefined,
            timeout : 10000, //10 seconds
            onSuccess : function (responseText, request) {},
            onError : function (request, isTimedOut) {}
        };

        if (url) {
            this.send(url, options);
        }

        return this;
    };
    
    //public method to abort request
    Xhr.prototype.abort = function () {
        this.request.abort();
    };

    //Send a request to url with options
    Xhr.prototype.send = function (url, options) {
        if (!url) {
            throw "Url should be set";
        }

        var self = this,
            requestTimer, //timer to handle timeout,
            onRequestComplete,
            serializedData,
            timedOut = false;

        //merged options from default options
        options = mergeObjects(self.defaultOptions, options);

        //lazy init getting cross browser XHR
        CrossBrowserXhr = CrossBrowserXhr || getCrossBrowserXhr();

        //init XMLHttpRequest
        self.request = new CrossBrowserXhr();

        if (options.data) {
            serializedData = serialize(options.data);
        }

        if (options.data && options.type === "GET") {
            //append serializedData data to url
            url += (url.search("\\?") === -1 ? "?" : "&") + serializedData;
        }

        self.request.open(options.type, url, options.async);

        if (options.data && options.type === "POST") {
            //set content type
            postContentType = "application/x-www-form-urlencoded";
            self.request.setRequestHeader('Content-Type', postContentType);
        }        
        
        //set timeout for async request
        if (options.async && options.timeout > 0) {
            requestTimer = setTimeout(function () {
                timedOut = true;
                self.abort();
            }, options.timeout);
        }

        //handle errors and success
        //on request completed
        onRequestComplete = function (request) {
            clearTimeout(requestTimer);

            if (self.request.status === 200) {
                var data = formatResponse(self.request, options.responseType);
                options.onSuccess(data, self.request);
            }
            else {
                options.onError(self.request, false);
            }

        };

        //listen ready state change events for async requests
        self.request.onreadystatechange = function () {
            if (timedOut) {
                options.onError(self.request, true);
            }
            else if (self.request.readyState === 4 && !timedOut) {
                onRequestComplete(self.request);
            }
        };


        self.request.send(serializedData);
        
        //call callback functions on request complete
        //for sync requests
        if (options.async === false) {
            onRequestComplete(self.request);
        }
    };

    //make it public
    Bee.Xhr = Xhr;
}(Bee));
