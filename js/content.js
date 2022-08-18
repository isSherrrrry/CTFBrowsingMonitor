console.log("%ccontent.js....", "color:green");
let html = `<div id="myp">Your Activity is Being Monitored</div>`;
let port = chrome.runtime.connect({ name: "content" });
let title = $("title").text() ? $("title").text() : "";
let scrollHeight, documentHeight, windowHeight, url, startTime, percent, pageK = "on";
let k;
let func = function (msg) {
    console.log(msg);
    let action = msg.action;
    console.log("action:" + action);
    if (action == "putK") {
        k = msg.k;
        console.log("k:" + k);
        if (k == "off") {
            $("#myp").remove();
        } else if (k == "on") {
            if ($("#myp").length == 0) {
                $("body").append(html);
            }
            console.log("recived putK:" + k);
            port.postMessage({ action: "sendData", startTime: getTime(), endTime: "", url: location.href, percent: "" });
        }
    }
}
init();


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log(request);
    sendResponse("content ...");
    let action = request.action;
    //console.log(action);  
    if (action == "putk") {
        k = request.k;
        if (k == "off") {
            $("#myp").remove();
        } else if (k == "on") {
            if ($("#myp").length == 0) {
                $("body").append(html);
            }
        }
    }
    if (action == "over") {
        //console.log("over");   
        port.onMessage.removeListener(func);
        if (k == "on" && pageK == "on") {
            pageK = "off";
            port.postMessage({ from: "content.js 45", action: "sendData", setScore: "on", startTime: startTime, endTime: getTime(), url: url, percent: percent, title: title });
        }
    }
    if (action == "activated") { init(); }
});



$(window).scroll(function () {
    scrollHeight = $(document).scrollTop();
    documentHeight = $(document).height();
    windowHeight = $(window).height();
    let currentPercent = Math.round((scrollHeight + windowHeight) / documentHeight * 100);
    if (currentPercent > percent) { percent = currentPercent; }
    // console.log(scrollHeight, documentHeight, windowHeight, percent);
});

function getTime() {
    let date = new Date();
    let Y = date.getFullYear();
    let M = Number(date.getMonth()) + 1;
    if (M < 10) { M = "0" + M; }
    let D = date.getDate();
    if (D < 10) { D = "0" + D; }
    let H = date.getHours();
    if (H < 10) { H = "0" + H; }
    let m = date.getMinutes();
    if (m < 10) { m = "0" + m; }
    let s = date.getSeconds();
    if (s < 10) { s = "0" + s; }
    return Y + "-" + M + "-" + D + " " + H + ":" + m + ":" + s;
}

window.onbeforeunload = function (e) {
    if (k == "on" && pageK == "on") {
        port.postMessage({ action: "sendData", setScore: "on", startTime: startTime, endTime: getTime(), url: url, percent: percent, title: title });
    }
}
setInterval(function () {
    if (location.href !== url) {
        if (k == "on" && pageK == "on") {
            port.postMessage({ action: "sendData", setScore: "on", startTime: startTime, endTime: getTime(), url: url, percent: percent, title: title });
        }
        init();
    }
}, 1000);


function init() {
    console.log("init...");
    pageK = "on";
    scrollHeight = $(document).scrollTop();
    documentHeight = $(document).height();
    windowHeight = $(window).height();
    url = location.href;
    startTime = getTime();
    if (documentHeight == windowHeight) { percent = 100; } else {
        percent = Math.round((scrollHeight + windowHeight) / documentHeight * 100);
    }
    port.onMessage.removeListener(func);
    port.onMessage.addListener(func);
    port.postMessage({ action: "getK" });
}