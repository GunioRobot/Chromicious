/**
 * @author Andrey Yasinetskiy (yasinecky@gmail.com)
 */

function deliciousRequest(endpoint, completeCallback) {
	setTimeout(function() {
		$.ajax( {
			type : "POST",
			url : endpoint,
			dataType : "xml",
			contentType: "application/x-www-form-urlencoded",
			beforeSend : function(req) {
				req.setRequestHeader('Authorization', 'Basic ' + btoa("cookie:cookie"));
				req.setRequestHeader('X-Chromicious-Delicious-Client', '1');
				req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			},
			processData : false,
			data: Chromicious.getInstance().storage.getAuthInfo(),
			error : function(xml, textStatus, errorThrown) {
				triggerSyncError('Request failed: ' + textStatus + '. Response was: ' + xml.responseText);
			},
			complete : completeCallback
		});
	}, 5000);
}

function startSynchronizationProcess() {
	var chromicious = Chromicious.getInstance();

	chromicious.storage.setSyncProcessStarted(1);

	chromicious.sendEvent('syncProcessStarted', null);
	
	deliciousRequest(DELICIOUS_ALL_URL,		
		/* A function to be called when the request finishes (after success and error callbacks are executed). */
		function(response, status) {
			if (status == 'error') {
				triggerSyncError('Request finished with: ' + status + '. Response was: ' + response.responseText);
				return;
			}

			parseAndSaveBookmarksResponse(response.responseText, function() {
				
				deliciousRequest(DELICIOUS_TAGS_URL,
					function(response, status) {
						if (status == 'error') {
							triggerSyncError('Request finished with: ' + status + '. Response was: ' + response.responseText);
							return;
						}

						parseAndSaveTagsResponse(response.responseText, function() {
							
							triggerSyncSuccess();
							
						}, function() { console.log('Error saving tags to database.'); });
					}
				);

			}, function() { console.log('Error saving bookmarks to database.'); });
		});
}

function triggerSyncSuccess() {
	var chromicious = Chromicious.getInstance();
	
	var currentDatetime = new Date();
	
	chromicious.sendEvent('onSyncSuccess', null);
	chromicious.storage.setLastStatus('success');
	chromicious.storage.setSyncProcessStarted(0);
	chromicious.storage.setLastFinishTime(currentDatetime.getTime());
	
	console.log('Bookmarks have been synchronized.');
}

function triggerSyncError(logMessage) {
	var chromicious = Chromicious.getInstance();
	
	var currentDatetime = new Date();
	
	chromicious.sendEvent('onSyncFailure', null);
	chromicious.storage.setLastStatus('error');
	chromicious.storage.setSyncProcessStarted(0);
	chromicious.storage.setLastFinishTime(currentDatetime.getTime());
	
	console.log(logMessage);
}

function parseAndSaveBookmarksResponse(xmlResponse, successCallback, errorCallback) {
	if (xmlResponse != '' && xmlResponse != null) {
		Chromicious.getInstance().storage.saveBookmarksFromXML(xmlResponse, errorCallback, successCallback);
	}
}

function parseAndSaveTagsResponse(xmlResponse, successCallback, errorCallback) {
	if (xmlResponse != '' && xmlResponse != null) {
		Chromicious.getInstance().storage.saveTagsFromXML(xmlResponse, errorCallback, successCallback)
	}
}

function performSearch(keyword, displayCallback) {
	Chromicious.getInstance().storage.searchBookmarks(keyword, function(tx, resultSet) {
		displayCallback(resultSet);
	}, function(error) {
		displayError('Database error while search bookmarks.', 3000);
	});
}

function performSearchByTag(tag, displayCallback) {
	Chromicious.getInstance().storage.getBookmarksByTag(tag, null, function(tx, resultSet) {
		displayCallback(resultSet);
	}, function(error) {
		displayError('Database error while search by tag.', 3000);
	});
}