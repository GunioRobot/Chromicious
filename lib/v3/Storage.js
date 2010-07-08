function ChromiciousStorage() {
	
	var dbInstance = null;
	
	try {	
		dbInstance = openDatabase(DATABASE_NAME, '1.0', 'Offline bookmarks storage for chromicious extension', DATABASE_SIZE);
		
		if (dbInstance != null) {
			dbInstance.transaction(function(tx) {
				tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_chromicious_bookmarks (id INTEGER PRIMARY KEY AUTOINCREMENT, href TEXT, description TEXT, extended TEXT, hash TEXT, meta TEXT, others INTEGER, tag TEXT, time TEXT)');
				tx.executeSql('CREATE TABLE IF NOT EXISTS tbl_chromicious_tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tag TEXT, count INTEGER)');
				
				localStorage.setItem('chromicious-version', CHROMICIOUS_VERSION);
			}, function(tx, error) {
				console.log(error);
			});
		}
	} catch (err) {
		console.log(err);
	}
	
	this.getBookmarksBy = function(field, criteria, limit, resultCallback, errorCallback) {
		if (dbInstance != null) {
			dbInstance.readTransaction(function(tx) {
				tx.executeSql("SELECT * FROM tbl_chromicious_bookmarks " + ChromiciousStorage.buildQueryCriteria(field, criteria, limit), [],
						resultCallback, errorCallback);
			});
		}
	}
	
	this.getBookmarksAll = function(limit, resultCallback, errorCallback) {
		return this.getBookmarksBy('', '', limit, resultCallback, errorCallback);
	}
	
	this.getBookmarksByTag = function(tag, limit, resultCallback, errorCallback) {
		return this.getBookmarksBy('tag', tag, limit, resultCallback, errorCallback);
	}
	
	this.saveBookmarksFromXML = function(xml, errorCallback, successCallback) {
		if (dbInstance != null) {
			dbInstance.transaction(function(tx) {
				
				tx.executeSql('DELETE FROM tbl_chromicious_bookmarks', [], function(tx, rs) {
				}, function(tx, error) {
					console.log('error while clearing bookmarks');
				});
				
				$(xml).find("post").each(
					function(i) {
						var href 		= $(this).attr('href');
						var descr 		= $(this).attr('description');
						var hash 		= $(this).attr('hash');
						var tag 		= $(this).attr('tag');
						var time 		= $(this).attr('time');
						var extended 	= $(this).attr('extended');
						var meta 		= $(this).attr('meta');
						var others 		= $(this).attr('others');

						tx.executeSql('INSERT INTO tbl_chromicious_bookmarks (href, description, hash, tag, time, extended, meta, others) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
							[href, descr, hash, tag, time, extended, meta, others], function(tx, rs) {
						}, function(tx, error) {
							console.log('error ' + error + tx);
						});
					}
				);
			}, function() {
				errorCallback();
			}, function() {
				successCallback();
			});
		}
	}
	
	this.saveTagsFromXML = function(xml, errorCallback, successCallback) {
		if (dbInstance != null) {
			dbInstance.transaction(function(tx) {
				
				tx.executeSql('DELETE FROM tbl_chromicious_tags', [], function(tx, rs) {
				}, function(tx, error) {
					console.log('error while clearing tags');
				});
				
				$(xml).find("tag").each(
					function(i) {
						var tag 		= $(this).attr('tag');
						var count 		= $(this).attr('count');

						tx.executeSql('INSERT INTO tbl_chromicious_tags (tag, count) VALUES(?, ?)',
							[tag, count], function(tx, rs) {
						}, function(tx, error) {
							console.log('error ' + error + tx);
						});
					}
				);
			}, 	function() {
				errorCallback();
			}, function() {
				successCallback();
			});
		}
	}
	
	this.getPopularTags = function(limit, resultCallback, errorCallback) {
		if (dbInstance != null) {
			dbInstance.readTransaction(function(tx) {
				tx.executeSql('SELECT * FROM tbl_chromicious_tags ORDER BY count DESC LIMIT '+limit, [], resultCallback, errorCallback);
			});
		}
	}
	
	this.getTagsAll = function(resultCallback, errorCallback) {
		if (dbInstance != null) {
			dbInstance.readTransaction(function(tx) {
				tx.executeSql('SELECT * FROM tbl_chromicious_tags ORDER BY count DESC', [], resultCallback, errorCallback);
			});
		}
	}
	
	this.searchBookmarks = function(keyword, resultCallback, errorCallback) {
		if (dbInstance != null) {
			dbInstance.readTransaction(function(tx) {
				tx.executeSql('SELECT * FROM tbl_chromicious_bookmarks WHERE href like "%'+keyword+'%"', [], resultCallback, errorCallback);
			});
		}	
	}
	
	this.checkBookmarksCount = function(resultCallback, errorCallback) {
		if (dbInstance != null) {
			dbInstance.readTransaction(function(tx) {
				tx.executeSql('SELECT COUNT(*) FROM tbl_chromicious_bookmarks', [], resultCallback, errorCallback);
			});
		}
	}
	
	this.removeAll = function() {
		if (dbInstance != null) {
			dbInstance.transaction(function(tx) {
				tx.executeSql('DELETE FROM tbl_chromicious_bookmarks', [], function(tx, r) {}, function(tx, r) {});
				tx.executeSql('DELETE FROM tbl_chromicious_tags', [], function(tx, r) {}, function(tx, r) {});
			}, function() {}, function() {});
		}
	}
	
	this.getNumberOfRecentBookmarks = function() {
		return (localStorage.getItem('chromicious-num-recent') != null 
				&& localStorage.getItem('chromicious-num-recent') != '') ?
				localStorage.getItem('chromicious-num-recent') : RECENT_BOOKMARKS_TOTAL;
	}

	this.setNumberOfRecentBookmarks = function(value) {
		localStorage.setItem('chromicious-num-recent', value);
	}

	this.getBookmarksSyncInterval = function () {
		return (localStorage.getItem('chromicious-syncinterval') != null 
				&& localStorage.getItem('chromicious-syncinterval') != '') ? 
				localStorage.getItem('chromicious-syncinterval'): BOOKMARKS_SYNC_INTERVAL;
	}
	
	this.setBookmarksSyncInterval = function(interval) {
		localStorage.setItem('chromicious-syncinterval', interval);
	}
	
	this.setBookmarksSyncIntervalId = function(id) {
		localStorage.setItem('chromicious-syncinterval-id', id);
	}

	this.getBookmarksSyncIntervalId = function () {
		return localStorage.getItem('chromicious-sync-interval-id');
	}
	
	this.getAuthInfo = function() {
		return localStorage.getItem('chromicious-auth-info');
	}
	
	this.setAuthInfo = function(authInfo) {
		localStorage.setItem('chromicious-auth-info', authInfo);
	}
	
	this.getUsername = function() {
		return localStorage.getItem('chromicious-username');
	}
	
	this.setUsername = function(value) {
		return localStorage.setItem('chromicious-username', value);
	}
	
	this.setSyncProcessStarted = function(value) {
		localStorage.setItem('chromicious-sync-inprogress', value);
	}
	
	this.isSyncInProgress = function() {
		return localStorage.getItem('chromicious-sync-inprogress');
	}
	
	this.setLastStatus = function(value) {
		localStorage.setItem('chromicious-last-status', value);
	}
	
	this.getLastStatus = function() {
		return localStorage.getItem('chromicious-last-status');
	}
	
	this.isFirstLoad = function() {
		return (localStorage.getItem('chromicious-isfirstload') == 1 || localStorage.getItem('chromicious-isfirstload') == null);
	}
	
	this.setFirstLoad = function(value) {
		return localStorage.setItem('chromicious-isfirstload', value);
	}
	
	this.setLastFinishTime = function(value) {
		localStorage.setItem('chromicious-last-time', value);
	}
	
	this.getLastFinishTime = function() {
		return localStorage.getItem('chromicious-last-time');
	}
	
	this.cleanLegacy = function() {
		if (localStorage.getItem('chromicious-version') == '2.4.3' 
			|| localStorage.getItem('chromicious-version') == '2.5'
			|| localStorage.getItem('chromicious-version') == '2.5.1') {
			localStorage.removeItem('delicious-ext-username');
			localStorage.removeItem('is-first-load');
			localStorage.removeItem('delicious-ext-password');
			localStorage.removeItem('delicious-ext-is-pass-saved');
			localStorage.removeItem('delicious-ext-prefs-saved');
			localStorage.removeItem('is-sync-inprogress');
			localStorage.removeItem('delicious-ext-sync-interval');
			localStorage.removeItem('delicious-ext-interval-id');
		}
	}
}

ChromiciousStorage.buildQueryCriteria = function(field, criteria, limit) {
	var queryCriteria = '';
	if (field != '' && criteria != '') {
		queryCriteria = queryCriteria+' WHERE '+field+' LIKE "%'+criteria+'%"';
	}
	
	if (limit != '' && limit != null) {
		queryCriteria = queryCriteria+' LIMIT '+limit;
	}
	
	return queryCriteria;
}