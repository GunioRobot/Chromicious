/**
 * @author Andrey Yasinetskiy (yasinecky@gmail.com)
 */
function displayError(message, closeInterval) {
	if (assertMessage(message)) {
		hideAllMessages();
		$('#error_box').html(message).show(1, function() {
			setTimeout(hideError, closeInterval);
		});
	}
}

function hideError() {
	$('#error_box').hide().html('');
}

function displayNotification(message, closeInterval) {
	if (assertMessage(message)) {
		hideAllMessages();
		$('#notification_box').html(message).show(1, function() {
			setTimeout(hideNotification, closeInterval);
		});
	}
}

function hideNotification() {
	$('#notification_box').hide().html('');
}

function displayProcess(message) {
	if (assertMessage(message)) {
		hideAllMessages();
		$('#process_box').html(message).show();
	}
}

function hideProcess() {
	$('#process_box').hide().html('');
}

function assertMessage(message) {
	return (message != '' && message != null) ? true : false;
}

function hideAllMessages() {
	hideError();
	hideProcess();
	hideNotification();
}