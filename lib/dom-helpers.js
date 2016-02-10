var isDataSetSupport = testIsDataSetSupport();

function toArray(arrayLike){
    return Array.prototype.slice.call(arrayLike);
}

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

function getElementsByTagNames(tagsArray,obj) {
    if (!obj) obj = document;
    var results= [];
    var i=0;
    for (;i<tagsArray.length;i++) {
        var tags = obj.getElementsByTagName(tagsArray[i]);
        var j=0;
        for (;j<tags.length;j++) {
            results.push(tags[j]);
        }
    }
    return results;
}

function getClosestParentByAttribute(elem, attr) {

    // Get closest match
    for ( ; elem && elem !== document; elem = elem.parentNode ) {

        if (hasDataSet(elem,attr)) {
            return elem;
        }

    }
    return false;
}

function getChildrenByAttribute(elem, attr) {
    return toArray(elem.getElementsByTagName('*'))
    .filter(function(el){
        if (hasDataSet(el,attr)) return true;
    });
}

// based on modrenizer test
function testIsDataSetSupport() {
    var n = document.createElement('div');
    n.setAttribute('data-a-b', 'c');
    return !!(n.dataset && n.dataset.aB === 'c');
}

function getDataSet_unsupported(node, attr) {
    if (node.nodeType !== Node.ELEMENT_NODE ) return false;

    return node.getAttribute('data-' + toDashed(attr));
}

function getDataSet(node, attr) {
    if (node.nodeType !== Node.ELEMENT_NODE ) return false;

    return node.dataset[attr];
}

function hasDataSet(node, attr){
    return (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-' + toDashed(attr)));
}

function toDashed(name) {
    return name.replace(/([A-Z])/g, function(u) {
        return "-" + u.toLowerCase();
    });
}

// from http://jaketrent.com/post/addremove-classes-raw-javascript/
// used instead of classList because of lacking browser support
function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}



module.exports = {
    getDataSet: isDataSetSupport ? getDataSet : getDataSet_unsupported,
    hasDataSet: hasDataSet,
    getElementsByTagNames: getElementsByTagNames,
    getClosestParentByAttribute: getClosestParentByAttribute,
    getChildrenByAttribute: getChildrenByAttribute,
    ready: ready,
    toArray: toArray,
    addClass: addClass,
    removeClass: removeClass
};


