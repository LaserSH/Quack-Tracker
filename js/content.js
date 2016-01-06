$(document).ready(function(){
    var url = window.location.href;

    var urlStartIndex = url.search('//') + '//'.length;
    url = url.substring(urlStartIndex, url.length);
    var urlEndIndex = url.search('/');

    var domain = url.substring(0, urlEndIndex);
    // alert('You are on ' + domain);
});
