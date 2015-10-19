// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));

var dot = require("./lib/dot");
require("component-responsive-frame/child");

var template = dot.compile(require("./_boxes.html"));
var dialog = dot.compile(require("./_modal.html"));

window.commafy = function(s) {
  return s.toLocaleString().replace(/\.0+/, "");
};

var init = function(e) {
  var data = JSON.parse(e.target.responseText);

  var calendar = document.querySelector(".calendar");
  var focus = document.querySelector(".focus .boxes");
  var details = document.querySelector(".focus .details");

  calendar.innerHTML += template(data);;

  //filtering
  var interactive = document.querySelector(".interactive");
  var onToggle = function() {
    var filter = this.getAttribute("data-set-filter");
    interactive.setAttribute("data-filter", filter);
    document.querySelector(".toggle-box .toggle.selected").classList.remove("selected");
    this.classList.add("selected");
  };

  qsa(".toggle-box .toggle").forEach(e => e.addEventListener("click", onToggle));

  //select month
  var setMonth = function(month) {
    focus.innerHTML = template({ [month]: data[month] });
    details.innerHTML = "Each square to the left represents a single shipment. Click or tap to see its contents.";
  }
  var onMonth = function() {
    var focused = document.querySelector(".focused");
    if (focused) focused.classList.remove("focused");
    this.classList.add("focused");
    var month = this.getAttribute("data-month");
    if (!month) return;
    setMonth(month);
  };

  qsa(".calendar .month-group").forEach(el => el.addEventListener("click", onMonth));
  setMonth(1);

  //select shipment

  focus.addEventListener("click", function(e) {
    var month = e.target.getAttribute("data-month");
    var index = e.target.getAttribute("data-index");
    if (!month || !index) return;
    var shipment = data[month].shipments[index];
    details.innerHTML = dialog(shipment);
  });

};

var xhr = new XMLHttpRequest();
xhr.open("GET", "./assets/groupedData.json");
xhr.onload = init;
xhr.send();