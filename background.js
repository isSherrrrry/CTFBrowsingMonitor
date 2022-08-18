console.log("%cbackground.js...", "color:green");

chrome.runtime.onConnect.addListener(function (port) {
    port.onDisconnect.addListener(function () {
        //console.log(port);
        if (port.name == "popup") {
            chrome.storage.local.get(["k"], function (d) {
                // console.log(d);
                if (d.k == "on") {
                    //console.log(port.name);
                    //console.log(port.times);
                    chrome.storage.local.set({ "times": port.times });
                }
            });
        }
        if (port.name == "score") {

        }
    });
    port.onMessage.addListener(function (msg) {
        if (port.name == "popup") {
            port.times = msg.times;
            // console.log("times" + port.times);
        }
        if (port.name == "content") {

            let action = msg.action;
            
            if (action == "sendData") {
                console.log(msg);
                let setScore = msg.setScore;
                let url = msg.url;
                let title=msg.title;
                let endTime=msg.endTime;

                // let keywords = [];

                // if (url.includes('google.com')) {
                //     let stringStart = url.indexOf('=');
                //     let stringEnd = url.indexOf('&');
                //     let stringResult = url.substring(stringStart+1,stringEnd);
                //     console.log(stringResult);

                //     if (stringResult.includes('+')) {
                //         keywords = stringResult.split('+');
                //     }
                //     else{
                //         keywords = stringResult;
                //     }


                //     console.log(keywords);
                // }

                chrome.storage.local.get(["k", "myData"], function (d) {
                    if (d.k == "on") {
                        let data = d.myData;

                        let visited = false;

                        

                        for (let i = 0; i < data.length-1; i++) {
                            let tempUrl = data[i].url;
                            if (url == tempUrl) {
                                visited = true;
                                console.log(Boolean(visited));
                            }
                            
                        }

                        if (url.includes('google.com') || url.includes('bing.com') || url.includes('duckduckgo.com') || url.includes('baidu.com') || url.includes('yandex.com') || url.includes('wolframalpha.com') || url.includes('yahoo.com') || url.includes('excite.com')) visited = true;

                         

                        data.push(msg);



                        chrome.storage.local.set({ myData: data });
                        if (setScore && setScore == "on" && !visited) { 
                            chrome.windows.create({
                                type: "popup",
                                url: chrome.runtime.getURL("html/score.html?url=" + url+"&title="+title+"&endTime="+endTime)
                                ,state:"normal", width:800
                            }, function (e) {});
                        }
                    }
                });
            }
            if (action == "getK") {
                chrome.storage.local.get(["k"], function (d) {
                    let k = d.k;
                    console.log("k:"+k);
                    port.postMessage({ action: "putK", k: k });
                });
            }
        }
        if (port.name == "score") {
            console.log(msg);            
            let endTime=msg.endTime;
            let score1 = msg.score1;
            let score2 = msg.score2;
            let score3 = msg.score3;
            chrome.storage.local.get(["myData","scoreWindowId"], function (d) {
                let myData = d.myData;
                //console.log(myData)
                for(let i=myData.length-1;i>myData.length-5&&i>=0;i--){  
                    //console.log(i);                 
                    let t=myData[i].endTime;
                    //console.log(t);
                    if(String(endTime)==String(t)){
                        myData[i].score1=score1;
                        myData[i].score2=score2;
                        myData[i].score3=score3;
                        chrome.storage.local.set({"myData":myData});
                        port.postMessage({ action: "closeScorePage"});
                        break;
                    }
                }
            });
        }
    });
});

init();
function init() {
    chrome.storage.local.get(null, function (d) {
        //console.log(d);
        if (d.times == undefined) {
            //console.log(d.startTime);
            //console.log("times not found!");
            chrome.storage.local.set({ "myData": [] });
            chrome.storage.local.set({ "times": 0 });
            chrome.storage.local.set({ "startTime": Date.now() });
            chrome.storage.local.set({ "k": "off" });
        }
    });
}

/*
chrome.action.onClicked.addListener(function (tab) {
    chrome.tabs.create({ url: chrome.runtime.getURL("html/popup.html"), selected: true });
});
*/

chrome.tabs.onActivated.addListener(function (tab) {
    //console.log("onActivated...");
    //console.log(tab);
    let id = tab.tabId;
    chrome.tabs.sendMessage(id, { action: "activated" });
    console.log("%c"+id + " send activated...","color:green");
    chrome.tabs.query({}, function (tabs) {
        //console.log(tabs);   
        for (let i = 0; i < tabs.length; i++) {
            let id2 = tabs[i].id;
            let url = tabs[i].url;
            let url2 = tabs[i].pendingUrl;
            if (id == id2) {
                //console.log("url:"+url);
                //console.log("url2:"+url2);
                if (url2 && url2.match(/^chrome-extension/)) {
                    return;
                }
            }
        }
        for (let i = 0; i < tabs.length; i++) {
            let id2 = tabs[i].id;
            let url2 = tabs[i].url;
            if (url2 == undefined || !url2.match(/^http/)) {
                //console.log("id:"+id+"  ====  id2:"+id2,url2);
                //console.log("continue...");
                continue;
            }
            if (id2 !== id) {
                //console.log("%cid2:" + id2 + " send over: " + url2, "color:red");
                chrome.tabs.sendMessage(id2, { action: "over" });
            }
        }
    });
});