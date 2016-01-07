/*
 * Adopted from https://github.com/navjagpal/browser-timetracker
 *
 * Functions for popup.html
 */

var config = new Config();
var gsites = new Sites(config);
var totalTime = 0;

function addIgnoredSite(new_site) {
  return function() {
    chrome.extension.sendRequest(
       {action: "addIgnoredSite", site: new_site},
       function(response) {
          addLocalDisplay();
          updateTotalTime();
       });
  };
};

function padNumberBy2(num) {
  return ("00" + num).slice(-2);
}

function secondsToString(seconds) {
  if (config.timeDisplayFormat == Config.timeDisplayFormatEnum.MINUTES) {
    return (seconds/60).toFixed(2);
  }
  var years = Math.floor(seconds / 31536000);
  var days = Math.floor((seconds % 31536000) / 86400);
  var hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  var mins = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  var secs = (((seconds % 31536000) % 86400) % 3600) % 60;
  var s = "";
  if (years) {
    s = s + " " + years + "y";
  }
  if (days) {
    s = s + " " + days + "d";
  }
  if (hours) {
    s = s + " " + hours + ":";
  }
  if (mins) {
    s = s + "" + padNumberBy2(mins) + ":";
  }
  if (secs) {
    s = s + "" + padNumberBy2(secs.toFixed(0)) + "";
  }
  if (!years && !days && !hours && !mins && secs) {
    s = s + "s";
  }
  return s;
}

function updateTotalTime() {
  totalTime = 0;
  var sites = gsites.sites;
  var sortedSites = new Array();
  for (site in sites) {
   sortedSites.push([site, sites[site]]);
   totalTime += sites[site];
  }
  $("#total-time").text(secondsToString(totalTime));
}

function showClearTime() {
  if (config.lastClearTime) {
    var div = document.getElementById("lastClear");
    if (div.childNodes.length == 1) {
      div.removeChild(div.childNodes[0]);
    }
    div.appendChild(
      document.createTextNode("Last Reset: " + new Date(
        config.lastClearTime).toString()));
  }

  var nextClearStats = config.nextTimeToClear;
  if (nextClearStats) {
   nextClearStats = parseInt(nextClearStats, 10);
   nextClearStats = new Date(nextClearStats);
   var nextClearDiv = document.getElementById("nextClear");
   if (nextClearDiv.childNodes.length == 1) {
     nextClearDiv.removeChild(nextClearDiv.childNodes[0]);
   }
   nextClearDiv.appendChild(
     document.createTextNode("Next Reset: " + nextClearStats.toString()));
  }
}

function addLocalDisplay() {
  showClearTime();

  var old_tbody = document.getElementById("stats_tbody");
  var tbody = document.createElement("tbody");
  tbody.setAttribute("id", "stats_tbody");
  old_tbody.parentNode.replaceChild(tbody, old_tbody);

  /* Sort sites by time spent */
  var sites = gsites.sites;
  var sortedSites = new Array();
  for (site in sites) {
   sortedSites.push([site, sites[site]]);
  }
  sortedSites.sort(function(a, b) {
   return b[1] - a[1];
  });

  /* Show only the top 5 sites by default */
  var max = gsites.maxDisplayNumber;
  if (document.location.href.indexOf("show=all") != -1) {
   max = sortedSites.length;
  }

  var maxTime = 0;
  if (sortedSites.length) {
    maxTime = sites[sortedSites[0][0]];
  }
  var relativePct = 0;
  for (var index = 0; ((index < sortedSites.length) && (index < max));
      index++ ){
   var site = sortedSites[index][0];
   row = document.createElement("tr");
   cell = document.createElement("td");

   var removeImage = document.createElement('span');
   $(removeImage).addClass('glyphicon glyphicon-remove');
   $(removeImage).attr({
     "style": "color: red",
     "aria-hidden": "true"
   });
   removeImage.title = "Remove and stop tracking.";
   removeImage.width = 15;
   removeImage.height = 15;
   removeImage.onclick = addIgnoredSite(site);
   cell.appendChild(removeImage);

   var a = document.createElement('a');
   var linkText = document.createTextNode(site);
   a.appendChild(linkText);
   a.title = "Open link in new tab";
   a.href = site;
   a.target = "_blank";
   cell.appendChild(a);
   row.appendChild(cell);
   cell = document.createElement("td");
   cell.appendChild(document.createTextNode(secondsToString(sites[site])));
   row.appendChild(cell);
   cell = document.createElement("td");
   cell.appendChild(document.createTextNode(
     (sites[site] / totalTime * 100).toFixed(2)));
   relativePct = (sites[site]/maxTime*100).toFixed(2);
  //  row = setPercentageBG(row,relativePct);
   row.appendChild(cell);
   tbody.appendChild(row);
  }
}

function setPercentageBG(row,pct) {
  var color = "#e8edff";
  row.style.backgroundImage = "-webkit-linear-gradient(left, "+color+" "+pct+"%,#ffffff "+pct+"%)";
  row.style.backgroundImage = "    -moz-linear-gradient(left, "+color+" "+pct+"%, #ffffff "+pct+"%)";
  row.style.backgroundImage = "     -ms-linear-gradient(left, "+color+" "+pct+"%,#ffffff "+pct+"%)";
  row.style.backgroundImage = "      -o-linear-gradient(left, "+color+" "+pct+"%,#ffffff "+pct+"%)";
  row.style.backgroundImage = "         linear-gradient(to right, "+color+" "+pct+"%,#ffffff "+pct+"%)";
  return row;
}

function sendStats() {
  chrome.extension.sendRequest({action: "sendStats"}, function(response) {
   /* Reload the iframe. */
   var iframe = document.getElementById("stats_frame");
   iframe.src = iframe.src;
  });
}

function clearStats() {
  chrome.extension.sendRequest({action: "clearStats"}, function(response) {
    updateTotalTime();
    addLocalDisplay();
    showClearTime();
  });
}

$(document).ready(function(){
  $("#list").css('display', 'none');
  $("#options").click(function(){
      chrome.runtime.openOptionsPage();
  });
  $("#visualize").click(function(){
      chrome.tabs.create({"url": "visualization.html"});
  });
  $("#show-list").click(function(){
      $("#list").toggle('fast');
      addLocalDisplay();
  });
  $("#clear").click(function(){
      clearStats();
  })
  updateTotalTime();
});
