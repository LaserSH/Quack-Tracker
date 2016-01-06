/**
 * Adopted from https://github.com/navjagpal/browser-timetracker
 */

var config = new Config();
var sites = new Sites(config);

function updateClearStatsInterval() {
  var select = document.getElementById("clear_stats_interval");
  var option = select.options[select.selectedIndex];
  config.clearStatsInterval = option.value;
  // TODO(nav): Set nextTimeToClear in Config
  restoreOptions();
}

function updateListNumber() {
  var num = document.getElementById("new_list_number").value;
  if (isNaN(num) || num <= 0) {
    alert('Please enter a nonzero natural number');
    return;
  }
  localStorage.maxDisplayNumber = num;
  restoreOptions();
}

function addIgnoredSite() {
  var newSite = document.getElementById("new_ignored_site").value;
  if (newSite.indexOf("http://") != 0 &&
      newSite.indexOf("https://") != 0) {
    alert("Include http:// or https:// prefix.");
    return;
  }

  chrome.extension.sendRequest(
     {action: "addIgnoredSite", site: newSite},
     function(response) {
       restoreOptions();
     });
}

function removeIgnoredSites() {
  var select = document.getElementById("ignored_sites");
  var ignoredSites = [];
  for (var i = 0; i < select.children.length; i++) {
    var child = select.children[i];
    if (child.selected == false) {
      ignoredSites.push(child.value);
    }
  }
  localStorage['ignoredSites'] = JSON.stringify(ignoredSites);
  restoreOptions();
}

// Restores options from localStorage, if available.
function restoreOptions() {
  var ignoredSites = localStorage['ignoredSites'];
  if (!ignoredSites) {
    return;
  }
  ignoredSites = JSON.parse(ignoredSites);
  var select = document.getElementById("ignored_sites");
  select.options.length = 0;
  for (var i in ignoredSites) {
    var option = document.createElement("option");
    option.text = ignoredSites[i];
    option.value = ignoredSites[i];
    select.appendChild(option);
  }

  var clearStatsInterval = config.clearStatsInterval;
  select = document.getElementById("clear_stats_interval");
  for (var i = 0; i < select.options.length; i++) {
    var option = select.options[i];
    if (option.value == clearStatsInterval) {
      option.selected = true;
      break;
    }
  }

  var maxDisplayNumber = localStorage.maxDisplayNumber;
  select = document.getElementById("new_list_number");
  select.setAttribute('placeholder',
                    "Enter a nonzero natural number, now it is " + maxDisplayNumber);

}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("add_ignored").addEventListener(
    "click", addIgnoredSite);
  document.getElementById("remove_ignored").addEventListener(
    "click", removeIgnoredSites);
  document.getElementById("clear_stats_interval").addEventListener(
    "change", updateClearStatsInterval);
  document.getElementById("set_list_number").addEventListener(
      "click", updateListNumber);
  restoreOptions();
});
