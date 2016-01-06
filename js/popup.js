$(document).ready(function(){
    $("#options").click(function(){
        chrome.runtime.openOptionsPage();
    });
    $('#visualize').click(function(){
        chrome.tabs.create({"url": "visualization.html"});
    });
});
