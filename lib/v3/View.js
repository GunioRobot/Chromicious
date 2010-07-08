/* Initialize triggers */

try {
	chrome.extension.onConnect.addListener(function(port) {
		try {
			port.onMessage.addListener(function(msgObj) {				
				switch (msgObj.msg) {
					case 'onSyncSuccess':
						displayNotification('Bookmarks have been synchronized.', 3000);
						showRecentBookmarks();
					break;
					
					case 'onSyncFailure':
						displayError('Error while bookmarks synchronization.', 3000);
					break;
					
					case 'syncProcessStarted':
						displayProcess('Synchronizing bookmarks...');
					break;
					
					case 'updateOptionsWindow':
						restorePreferences();
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

/* // End triggers */

function displayTags(tx, resultSet) {
	if (resultSet != null) {
		$('#tags_container').html('');

		for(var i = 0; i < resultSet.rows.length; i++) {
			renderTagRow(resultSet.rows.item(i));
		}

		$('#tags_container').show();
	} else {
		// TODO: show empty message for tags
		// hide tags area
	}
}

function displayBookmarks(tx, resultSet) {
	if (resultSet != null) {
		// clear bookmarks result
		$('#empty_results').hide();
		$('#bookmarks_list_container').hide().html('');

		for(var i = 0; i < resultSet.rows.length; i++) {
			renderBookmarkRow(resultSet.rows.item(i));
		}

		$('#bookmarks_list_container').show();
	} else {
		$('#empty_results').show();
	}
}

function showMoreTags() {
	Chromicious.getInstance().storage.getTagsAll(function(tx, resultSet) {
		displayTags(tx, resultSet);
	}, function(error) {
		displayError('Database error while loading tags.', 3000);
	});
}

function showRecentBookmarks() {
	Chromicious.getInstance().storage.getPopularTags(POPULAR_TAGS_NUMBER, function(tx, resultSet) {
		displayTags(tx, resultSet);
	}, function(error) {
		displayError('Database error while loading tags.', 3000);
	});

	Chromicious.getInstance().storage.getBookmarksAll(Chromicious.getInstance().storage.getNumberOfRecentBookmarks(), function (tx, resultSet) {
		$('#bookmarks_title').html('Recent Bookmarks');
		displayBookmarks(tx, resultSet);
	}, function (error) {
		displayError('Database error while loading bookmarks.', 3000);
	});
}

function renderBookmarkRow(row) {
	$('<div class="bookmark_link"><a href="' + row.href
		+ ')" onClick="openBookmark(\'' + row.href
		+ '\'); return false">' + row.description + '</a></div>')
	.appendTo("#bookmarks_list_container");
}

function renderTagRow(row) {
	if (row.tag == 'Bookmarks') return;
	
	var countClass = '1';
	if (row.count > 1 && row.count <= 50) {
		countClass = '2';
	} else if (row.count > 50 && row.count <= 100) {
		countClass = '3';
	} else if (row.count > 100) {
		countClass = '4';
	}

	$('<a class="tag_link" id="tag_' + row.id + '" href="' + row.tag
		+ ')" onClick="chooseTag(\''+row.tag+'\', \'tag_'+row.id+'\'); return false"> ' + row.tag + ' </a>')
	.appendTo("#tags_container").addClass('tag_'+countClass);
}

function openBookmark(href) {
	window.parent.open(href, '_blank');
	return false;
}

function preferencesWindow() {
        var preferencesWindow = window.open(
			PREFERENCES_WINDOW_URL+'?tab=0', "preferencesWindow_" + PREFERENCES_WINDOW_URL,
            "toolbar=no, height=610," +
            "width=470"
		).focus();
}

function performSearchAndDisplayResult(keyword) {
	 if (jQuery.trim(keyword) == '') {
        return showRecentBookmarks();
	}
	
	performSearch(keyword, function(resultSet) {
		$('#bookmarks_title').html('Search Results');
		$('#bookmarks_list_container').hide().html('');

		if (resultSet != null && resultSet.rows.length > 0) {
			$('#empty_results').hide();

			for(var i = 0; i < resultSet.rows.length; i++) {
				renderBookmarkRow(resultSet.rows.item(i));
			}

			$('#bookmarks_list_container').show();
		} else {
			$('#empty_results').show();
		}	
	});
}

function chooseTag(tag, elId) {
	if (!$('#'+elId).hasClass('tag_selected')) {
		$('.tag_link').removeClass('tag_selected');
		$('#'+elId).addClass('tag_selected');

		performSearchByTag(tag, function(resultSet) {
			$('#bookmarks_title').html('Search Results');
			$('#bookmarks_list_container').hide().html('');

			if (resultSet != null && resultSet.rows.length > 0) {
				$('#empty_results').hide();

				for(var i = 0; i < resultSet.rows.length; i++) {
					renderBookmarkRow(resultSet.rows.item(i));
				}

				$('#bookmarks_list_container').show();
			} else {
				$('#empty_results').show();
			}	
		});
	} else {
		$('.tag_link').removeClass('tag_selected');
		showRecentBookmarks();
	}
}