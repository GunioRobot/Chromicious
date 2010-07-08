function Chromicious() {
	
	this.storage = new ChromiciousStorage();
	
	/* Adding default extension's listeners */
	
	try {
		chrome.extension.onConnect.addListener(function(port) {
			try {
				port.onMessage.addListener(function(msgObj) {
					console.log('Chromicious got a message: ' + msgObj.msg);
					
					switch (msgObj.msg) {
						case 'onSyncSuccess':
							console.log('Synchronization success.');
						break;
						
						case 'onSyncFailure':
							console.log('Synchronization failed.');
						break;
					}
				});
			} catch(e) {
				console.log('Error adding message listener. ' + e);
			} 
		});
	} catch (e) {
		console.log('Error adding extension listener.' + e);
	}
	
	this.synchronize = function() {
		if (this.isAllowSynchronize()) {
			console.log('Synchronization bookmarks process has been started.');
			
			startSynchronizationProcess();
		}
	}
	
	this.isAllowSynchronize = function() {
		var currentDatetime = new Date();
		
		var lastFinishTime = (this.storage.getLastFinishTime() == 'undefined'
			|| this.storage.getLastFinishTime() == null) ? 0 : this.storage.getLastFinishTime();

		var delta = currentDatetime.getTime() - this.storage.getLastFinishTime();

		if ((this.storage.isSyncInProgress() == 0 || this.storage.isSyncInProgress() == null)
			&& this.isUserAuthorized()) {

			return true;
		} else if (this.storage.isSyncInProgress() == 1 && delta >= this.storage.getBookmarksSyncInterval()
			&& this.isUserAuthorized()) {
			this.storage.setSyncProcessStarted(0);
			return true;
		}
		
		return false;
	}
	
	this.sendEvent = function(eventName, params) {
		try {
			chromiciousPort = chrome.extension.connect();
			chromiciousPort.postMessage({msg: eventName});
		} catch (e) {
			console.log('Unable to establish extension port connection: ' + e);
		}
	}
	
	this.sendNotification = function(title, message) {
		webkitNotifications.createNotification(
		  'resources/images/chromelicious48.png',
		  title,
		  message
		).show();
	}
	
	this.restartSynchronization = function() {
		if (this.isUserAuthorized()) {
			var id = null;
			
			if (id = this.storage.getBookmarksSyncIntervalId() != null) {
				clearInterval(id);
			}
			
			var id = setInterval(function() {
				Chromicious.getInstance().synchronize();
			}, this.storage.getBookmarksSyncInterval());

			this.storage.setBookmarksSyncIntervalId(id);
			
			console.log('Synchronization restarted with interval id: ' + id);
		}
	}

	this.stopSynchronization = function() {
		var interval = null;
		
		if (interval = this.storage.getBookmarksSyncIntervalId() != null) {
			clearInterval(interval);
			
			console.log('Synchronization stopped with interval id: ' + interval);
		}
	}

	this.isUserAuthorized = function() {
		return (this.storage.getAuthInfo() != null && this.storage.getAuthInfo() != ''
			&& this.getUsernameFromCookie(this.storage.getAuthInfo()) == this.storage.getUsername());
	}
	
	this.getUsernameFromCookie = function(cookie) {
		if (cookie) {
	    	var tmp = unescape(cookie.substr(cookie.indexOf('=')+1));
	    	tmp = tmp.substr(0, tmp.indexOf(' '));
	    	return tmp;
	    }

	    return '';
	}
}

Chromicious.getInstance = function() {
	var chromiciousInstance = null;
	
	var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        if (views[i].location.href == chrome.extension.getURL('lib/v3/bgprocess.html')) {
			chromiciousInstance = views[i].getChromiciousInstance();
            break;
        }
    }

	return chromiciousInstance;
}