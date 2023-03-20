let previous_result = null;

function updateData(override = false, override_data = null) {
	window_data = window.opener.getData();

	// defaults for if no settings yet
	if (!window_data.settings.url || window_data.settings.url === '') {
		window_data.settings.url = 'http://127.0.0.1:10101/api/graphql';
	}
	if (!window_data.settings.timeout_delay || window_data.settings.timeout_delay === '') {
		window_data.settings.timeout_delay = 300;
	}
	if (!window_data.settings.allow_analytics || window_data.settings.allow_analytics === null) {
		window_data.settings.allow_analytics = false;
	}

	if (override) {
		window_data = override_data;
	}

	// if result is different from previous result, update the UI
	if (window_data.connected !== previous_result) {
		previous_result = window_data.connected;

		// if focus is on the url field, don't update it
		if (document.activeElement.id !== 'url') {
			document.getElementById('url').value = window_data.settings.url;
		}

		// if focus is on the timeout delay field, don't update it
		if (document.activeElement.id !== 'timeout-delay') {
			document.getElementById('timeout-delay').value = window_data.settings.timeout_delay;
		}

		// if focus is on the allow analytics field, don't update it
		if (document.activeElement.id !== 'allow-analytics') {
			document.getElementById('allow-analytics').checked = window_data.settings.allow_analytics;
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

function resetSettings() {
	let data = {
		url: 'http://127.0.0.1:10101/api/graphql',
		timeout_delay: 300,
		allow_analytics: false
	};

	window.opener.sendToInspector(data);

	updateData(true, data);
}

function sendSettings() {
	let data = {
		url: document.getElementById('url').value,
		timeout_delay: parseInt(document.getElementById('timeout-delay').value) || 300,
		allow_analytics: document.getElementById('allow-analytics').checked
	};
	window.opener.sendToInspector(data);
}

window.onload = () => {
	// TODO: at some point maybe run sendSettings() on every input change with a debounce

	document.querySelector('#send').addEventListener('click', () => {
		sendSettings();
	});
	document.querySelector('#reset').addEventListener('click', () => {
		resetSettings();
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