if (window.location && isDeliciousHost(window.location.hostname)) {
	if (document.cookie) {
		var cookie = getCookie('_user');
		port = chrome.extension.connect();
		port.postMessage({msg: 'updateCookies', cookie: cookie});
	} else {
    	console.log('Unable to retrive delicious cookies.');
		port = chrome.extension.connect();
    	port.postMessage({msg: 'updateCookies', cookie: null});
  }
}

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.id == 'getPageDetails') {
            sendResponse(composeBookmarkObject());
		}
	}
);

function composeBookmarkObject() {
	var url = window.location.href;
	var title = document.title;
	if (!url) {
		return null;
	}

	var notes = '';
	var selection = window.getSelection();
	if (selection && selection.toString().length) {
		notes = selection.toString();
	}

	return {
		url: url,
		title: title,
		notes: notes
	};
}

function getCookie(cookieName) {
    var dCookie = document.cookie;
    var cookieLen = dCookie.length;
	if (cookieLen) {
		var beg = dCookie.indexOf(cookieName + '=');
		if (beg != -1) {
			var delim = dCookie.indexOf(";", beg);
			if (delim == -1) delim = cookieLen;
			return dCookie.substring(beg, delim);
		}
	}

	return '';
}

function isDeliciousHost(hostname) {
    if(hostname == 'delicious.com' ||
       (hostname.length >= 14 && (hostname.indexOf('.delicious.com') == hostname.length - 14))) {
        return true;
    }
}

$(document).keydown(function(e) {
	if (e.ctrlKey) {		
		if (e.which == 68) {
			port = chrome.extension.connect();
			port.postMessage({msg: 'saveBookmark'});
		}
	}
});