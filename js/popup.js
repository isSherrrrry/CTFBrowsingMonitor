console.log("%c popup.js", "color:red");
let port = chrome.runtime.connect({ name: "popup" });
let s;
let times;
init();
function init(o) {
    chrome.storage.local.get(null, function (d) {
        //console.log(d);
        if (d.times == undefined) {
            //console.log(d.startTime);
            //console.log("times not found!");
            chrome.storage.local.set({ "myData": [] });
            chrome.storage.local.set({ "times": 0 });
            $(".time").text("00:00:00");          
            chrome.storage.local.set({ "k": "off" });
            $(".start").text("Start");
        } else {            
            $(".time").text(toHHmmss(d.times));
        }
        if (d.k == "on") {
            $(".start").text("Pause");
        } else if (d.k == "off") {
            $(".start").text("Start");
        }
    });
}

function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    var wopts = {
        bookType: 'xlsx',
        bookSST: false, 
        type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    });
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    return blob;
}


function save(url, filename) {
    //console.log(url); 
    //console.log(filename);   
    //chrome.downloads.setShelfEnabled(false);  //禁止浏览器下面弹出下载提示  需要"downloads.shelf" 权限 
    chrome.downloads.download({
        url: url,
        filename: filename,
        //conflictAction: "overwrite", //"uniquify", "overwrite", or "prompt"
        saveAs: true
    }, function (e) {
        // console.log(e);
        chrome.storage.local.set({"times":0});
        jt("off");   
        chrome.storage.local.get(null, function (d) {
            for (let k in d) {
                chrome.storage.local.remove(k);
                //console.log("remove:"+k);
            }
            //console.log("init");
            init();
            setTimeout(function(){
                chrome.tabs.query({}, function (tabs) {
                    for (let i = 0; i < tabs.length; i++) {
                        let url = tabs[i].url;
                        let id = tabs[i].id;
                        //console.log(url);
                        if (url.match(/^http/)) {
                           // console.log(id,"put off");
                            chrome.tabs.sendMessage(id, { action: "putk", k: "off" });
                        }
                    }
                });
            },200)
            
        });
    });
}

chrome.storage.local.get(["k"], function (d) {
    if (d.k == "on"){ jt("on"); }
});
function jt(o) {    
    if (o == "on") {
        s = setInterval(function () {
            chrome.storage.local.get(["times", "startTime", "k"], function (d) {
                //console.log(d);
                let k = d.k;
                if (k == "off") { return; }
                times = d.times;                
                let startTime = d.startTime;      
                let currentTime= Date.now();        
                times = times+currentTime - startTime;                            
                if(times>0){$(".time").text(toHHmmss(times));}else{$(".time").text("00:00:00");}
                port.postMessage({ times:times});
            });
        }, 1000);
    } else if (o == "off") {
        chrome.storage.local.set({ "times": times });    
        clearInterval(s);
    }
}
$(".start").click(function () {
    chrome.storage.local.get(["k"], function (d) {
        let k = d.k;
        //console.log(k);
        if (k == "off") { 
            chrome.storage.local.set({"startTime":Date.now()});          
            jt("on");            
            chrome.storage.local.set({ "k": "on" });
            $(".start").text("Pause");
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    let url = tabs[i].url;
                    let id = tabs[i].id;
                    //console.log(url);
                    if (url.match(/^http/)) {
                       // console.log(id,"put on");
                        chrome.tabs.sendMessage(id, { action: "putk", k: "on" });
                    }
                }
            });
        } else {
            jt("off"); 
            chrome.storage.local.set({ "k": "off" });
            $(".start").text("Start");
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    let url = tabs[i].url;
                    let id = tabs[i].id;
                    //console.log(url);
                    if (url.match(/^http/)) {
                        //console.log(id,"put off");
                        chrome.tabs.sendMessage(id, { action: "putk", k: "off" });
                    }
                }
            });
        }
    });
});
$(".clear").click(function () {
    chrome.storage.local.set({"times":0});
    jt("off");   
    chrome.storage.local.get(null, function (d) {
        for (let k in d) {
            chrome.storage.local.remove(k);
            //console.log("remove:"+k);
        }
        //console.log("init");
        init();
        setTimeout(function(){
            chrome.tabs.query({}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    let url = tabs[i].url;
                    let id = tabs[i].id;
                    //console.log(url);
                    if (url.match(/^http/)) {
                       // console.log(id,"put off");
                        chrome.tabs.sendMessage(id, { action: "putk", k: "off" });
                    }
                }
            });
        },200)
        
    });
    $(".notice").hide();
});
$(".save").click(function () {
    let arr = [['startTime', 'endTime', "url", 'percent',"score1", "score2", "score3"]];
    chrome.storage.local.get(["myData"], function (d) {
        let myData = d.myData;
        console.log(myData);
        for (let i = 0; i < myData.length; i++) {
            let startTime = myData[i].startTime;
            let endTime = myData[i].endTime;
            let url = myData[i].url;
            let percent = myData[i].percent;
            let score1=myData[i].score1?myData[i].score1:"";
            let score2=myData[i].score2?myData[i].score2:"";
            let score3=myData[i].score3?myData[i].score3:"";
            arr.push([startTime, endTime, url, percent, score1, score2, score3]);
        }
        //console.log(arr);        
        let sheet = XLSX.utils.aoa_to_sheet(arr);
        let saveUrl = URL.createObjectURL(sheet2blob(sheet));
        // console.log(sheet);
        //console.log(url);
        save(saveUrl, "excel.xlsx");
    });
    $(".notice").show();
});
$(".start,.stop,.clear,.save").mouseover(function () {
    $(this).css({ "font-size": "33px" });
});
$(".start,.stop,.clear,.save").mouseout(function () {
    $(this).css({ "font-size": "30px" });
});
function toHHmmss(date) {
    var time;
    var hours = parseInt((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = parseInt((date % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = (date % (1000 * 60)) / 1000;
    time = (hours < 10 ? ('0' + hours) : hours) + ':' + (minutes < 10 ? ('0' + minutes) : minutes) + ':' + (seconds < 10 ? ('0' + Math.trunc(seconds)) : Math.trunc(seconds));
    return time;
}
