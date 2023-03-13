let previous_result = null;

function updateData() {
	window_data = window.opener.getData();

	// if result is different from previous result, update the UI
	if (window_data.connected !== previous_result) {
		previous_result = window_data.connected;

		// if focus is on the url field, don't update it
		if (document.activeElement.id !== 'url') {
			document.getElementById('url').value = window_data.url;
		}
		

		if (!window_data.connected) {
			let class_to_remove = ['hidden', 'info', 'question'];
			for (let i = 0; i < class_to_remove.length; i++) {
				document.getElementById('message-container').classList.remove(class_to_remove[i]);
			}
			document.getElementById('message-container').classList.add('caution');
		} else {
			let class_to_remove = ['hidden', 'caution', 'question'];
			for (let i = 0; i < class_to_remove.length; i++) {
				document.getElementById('message-container').classList.remove(class_to_remove[i]);
			}
			document.getElementById('message-container').classList.add('info');
		}

		document.getElementById('error-message').innerHTML = window_data.message;
	}

	setTimeout(() => {
		updateData();
	}, 300);
}

function sendSettings() {
	let data = {};
	document.querySelectorAll('input').forEach((input) => {
		data[input.name] = input.value;
	});
	window.opener.sendToInspector(data);
}

window.onload = () => {
	document.querySelector('#send').addEventListener('click', () => {
		sendSettings();
	});
	// keyup event is not triggered when the user clicks on the "return" key
	document.querySelector('form').addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.keyCode === 13) {
			e.preventDefault();
			sendSettings();
		}
	});

	updateData();
};