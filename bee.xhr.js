/*jslint white: true, browser: true, devel: true, windows: true, evil: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */

/**
 * XMLHttpRequest handler for BeeJs
 *
 * Usage :
 *     var request = new Bee.Xhr; 
 *     request.send("http://example.com/ajax.php", {
 *         type : "GET",
 *         async : true,
 *         timeout : 10000,
 *         onSucess : function(response){
 *             console.log('succes');
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
    var RequestObject, //holds crossbrowser XMLHttpRequest object  
        Xhr, // main class
        formatResponse, //function to format response
        mergeObjects; //function to merge objects
       
    //get crossbrowser request object 
    RequestObject = (function () {
        var XMLHttpRequest = XMLHttpRequest || undefined;
        //if IE
        if (typeof XMLHttpRequest === "undefined") {
            XMLHttpRequest = function () {
                //IE 5 uses Msxml2.XMLHTTP
                var greaterThanIE5 = navigator.userAgent.indexOf("MSIE 5") > -1;
                return new ActiveXObject(
                    greaterThanIE5 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
                );
            };
        }
        if (!XMLHttpRequest) {
            throw "XMLHttpRequest not supported";
        }
        return XMLHttpRequest;
    }());

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

    //format response text as text, xml and json
    formatResponse = function (response, responseType) {
        if (responseType === "xml") {
            return response.responseXML;
        }
        else if (responseType === "json") {
            return eval('(' + response.responseText + ')'); 
        }
        else { //text
            return response.responseText;
        }
    };

    //Main XHR class
    Xhr = function () {
        this.request = undefined;

        //default options
        this.options = {
            type : "GET",
            async : true,
            responseType : "text",
            timeout : 1000,
            onSucess : function (responseText, request) {},
            onError : function (request, isTimedOut) {}
        };

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

        var that = this,
            request, //alias for that.request
            requestTimer, //timer to handle timeout,
            onRequestComplete,
            timedOut  = false;

        //merged options from default options
        options = mergeObjects(that.options, options);

        //init XMLHttpRequest
        that.request = request = new RequestObject();
        request.open(options.type, url, options.async);

        //set timeout for async request
        if (options.async && options.timeout > 0) {
            requestTimer = setTimeout(function () {
                console.log('timedout');
                timedOut = true;
                that.abort();
            }, options.timeout);
        }

        //handle errors and success
        //on request completed
        onRequestComplete = function (request) {
            if (request.status === 200) {
                options.onSucess(formatResponse(request), request);
            }
            else {
                options.onError(request, false);
            }
        };

        //listen ready state change events for async requests
        request.onreadystatechange = function () {
            if (timedOut) {
                options.onError(request, true);
            }
            else if (request.readyState === 4 && !timedOut) {
                onRequestComplete(request);
                clearTimeout(requestTimer);
            }
        };

        request.send();
        
        //call callback functions on request complete
        //for sync requests
        if (options.async === false) {
            onRequestComplete(request);
        }
    };

    //make it public
    Bee.Xhr = Xhr;
}(Bee));
