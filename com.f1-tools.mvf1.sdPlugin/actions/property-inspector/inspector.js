/// <reference path="../../libs/js/property-inspector.js" />
/// <reference path="../../libs/js/utils.js" />

let window_data = {
    connected: true,
    message: 'Connected to MVF1',
    url: '',
}

function showError(payload) {
    // $PI.logMessage('showError ' + JSON.stringify(payload));
    if (!payload || (!payload.error && !payload.message) || payload.error) {
        document.getElementById('message-container').classList.remove('hidden');
        document.getElementById('error-message').innerHTML = payload.error;
        window_data.connected = false;
        window_data.message = payload.error;
    } else if (payload.message) {
        document.getElementById('message-container').classList.add('hidden');
        document.getElementById('error-message').innerHTML = payload.message;
        window_data.connected = true;
        window_data.message = payload.message;
    } else {
        console.log('Unknown payload', JSON.stringify(payload));
    }
}

function sendTest() {
    //$PI.logMessage('sendTest');
    $PI.sendToPlugin({data: false});
}

function openURL(url) {
    $PI.openUrl(url);
}

$PI.onConnected((jsn) => {
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {action, payload, context} = actionInfo;
    const {settings, coordinates} = payload;

    let action_uuid = action.split('.')[3] || false;

    const form = document.getElementById(action_uuid) || false;

    $PI.onSendToPropertyInspector(action, ({payload}) => { showError(payload); });

    if (form) {
        if (settings) {
            Utils.setFormValue(settings, form);
        }
        form.style.display = 'unset';
        form.addEventListener(
            'input',
            Utils.debounce(150, () => {
                const value = Utils.getFormValue(form);
                $PI.setSettings(value);
            })
        );
    }

    sendTest();

    $PI.getGlobalSettings();
});

$PI.onDidReceiveGlobalSettings(({payload}) => {
    if (payload.settings) {
        // $PI.logMessage('onDidReceiveGlobalSettings url: ' + payload.settings.url);
        window_data.url = payload.settings.url;
        // re-run connection test
        sendTest();
    }
})

window.sendToInspector = (data) => {
    // $PI.logMessage('sendToInspector ' + JSON.stringify(data))
    $PI.setGlobalSettings({url: data.url});
    $PI.getGlobalSettings();
};

window.getData = () => {
    return window_data;
};

document.querySelector('#open-external').addEventListener('click', () => {
    window.open('../../external.html');
});
