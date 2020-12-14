chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({ 'url': 'https://webui.mybti.cn/', 'selected': true }, function (tab2) {
    });
});