/// <reference path="../../libs/js/property-inspector.js" />
/// <reference path="../../libs/js/utils.js" />

let pi_uuid = '';

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

$PI.onConnected((jsn) => {
    const form = document.querySelector('#property-inspector');
    const {actionInfo, appInfo, connection, messageType, port, uuid} = jsn;
    const {payload, context} = actionInfo;
    const {settings} = payload;

    //$PI.logMessage(JSON.stringify(jsn));

    pi_uuid = uuid;

    if (form && settings) {
        Utils.setFormValue(settings, form);

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

$PI.onSendToPropertyInspector('com.f1-tools.mvf1.rewind-all', ({payload}) => { showError(payload); });
$PI.onSendToPropertyInspector('com.f1-tools.mvf1.fast-forward-all', ({payload}) => { showError(payload); });
$PI.onSendToPropertyInspector('com.f1-tools.mvf1.sync-to-dialogue', ({payload}) => { showError(payload); });
$PI.onSendToPropertyInspector('com.f1-tools.mvf1.play-pause-all', ({payload}) => { showError(payload); });

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
