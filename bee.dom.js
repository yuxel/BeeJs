/*jslint white: true, browser: true, devel: true, 
 windows: true, evil: true, onevar: true, undef: true, 
 nomen: true, eqeqeq: true, plusplus: true, bitwise: true, 
 regexp: true, newcap: true, immed: true */

/**
 * DOM traversing, manipulating and event binding 
 */ 

var Bee = Bee || {};

(function (Bee) {
    var dom = {};

    dom.findByTagName = function (tagName, parentNode) {
        parentNode = parentNode || document;
        return parentNode.getElementsByTagName(tagName);
    };

    dom.getById = function (id, parentNode) {
        parentNode = parentNode || document;
        return parentNode.getElementById(id);
    };

    dom.getById = function (id, parentNode) {
        parentNode = parentNode || document;
        return parentNode.getElementById(id);
    };

    dom.getNextSibling = function (el) {
        var nextSibling = el.nextSibling;
        while(nextSibling && nextSibling.nodeType != 1) {
            nextSibling = nextSibling.nextSibling
        }
        return nextSibling;
    };

    dom.getPreviousSibling = function (el) {
        var previousSibling = el.previousSibling;
        while(previousSibling && previousSibling.nodeType != 1) {
            previousSibling = previousSibling.previousSibling
        }
        return previousSibling;
    };

    dom.getParentNode = function (el) {
        return el.parentNode;
    };


    dom.getChildNodes = function (el) {
        var nodes = el.childNodes;
        var result = [];
        for(var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType == 1) {
                result.push(nodes[i]);
            }
        }
        
        return result;
    };

    dom.getFirstChild = function (el) {
        var child = el.firstChild;
        while (child.nodeType!=1) {
            child = child.nextSibling;
        }
        return child;
    }

    dom.getLastChild = function (el) {
        var child = el.lastChild;
        while (child.nodeType!=1) {
            child = child.previousSibling;
        }
        return child;
    }

    dom.setText = function (el, text) {
        el.innerHTML = text;
    }

    dom.getAttribute = function (el, attr) {
        return el.getAttribute(attr);
    }

    dom.setAttribute = function (el, attr, val) {
        return el.setAttribute(attr, val);
    }

    dom.cloneElement = function (el) {
        return el.cloneNode(true);
    }

    dom.createElement = function (el) {
        return document.createElement(el);
    }

    dom.removeElement = function (el) {
        el && el.parentNode && el.parentNode.removeChild(el);
    }

    dom.appendElement = function (el, appendTo) {
        appendTo.appendChild(el);
    }

    dom.prependElement = function (el, prependTo) {
        prependTo.insertBefore(el, prependTo.firstChild);
    }

    dom.putBeforeElement = function (el, refEl) {
        refEl.parentNode.insertBefore(el, refEl);
    }

    dom.putAfterElement = function (el, refEl) {
        refEl.parentNode.insertBefore(el, refEl.nextSibling);
    }

    //make it public
    Bee.dom = dom;
}(Bee));
