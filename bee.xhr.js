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
 *         responseType : "json", //default is text
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
        var crossBrowserXHR = XMLHttpRequest || undefined;
        //if IE
        if (typeof crossBrowserXHR === "undefined") {
            crossBrowserXHR = function () {
                //IE 5 uses Msxml2.XMLHTTP
                var userAgent = navigator.userAgent,
                    greaterThanIE5;

                greaterThanIE5 = userAgent.indexOf("MSIE 5") > -1;
                return new ActiveXObject(
                    greaterThanIE5 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
                );
            };
        }
        if (!crossBrowserXHR) {
            throw "XMLHttpRequest not supported";
        }
        return crossBrowserXHR;
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
        this.options = {
            type : "GET",
            async : true,
            responseType : "text",
            timeout : 10000, //10 seconds
            onSucess : function (responseText, request) {},
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
                timedOut = true;
                that.abort();
            }, options.timeout);
        }

        //handle errors and success
        //on request completed
        onRequestComplete = function (request) {
            clearTimeout(requestTimer);

            if (request.status === 200) {
                var data = formatResponse(request, options.responseType);
                options.onSucess(data, request);
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
