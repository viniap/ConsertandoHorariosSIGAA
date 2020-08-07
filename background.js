chrome.webNavigation.onDOMContentLoaded.addListener(function() {
    chrome.tabs.insertCSS(null, {file: './styles.css'});
    chrome.tabs.executeScript(null, { file: "./foreground.js" }, function() {
        chrome.tabs.executeScript(null, { file: "./clear.js" });
    });
}, {url: [{urlMatches : 'https://sig.unb.br/sigaa/*'}]});