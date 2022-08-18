console.log("%cscore.js...", "color:blue");
let port = chrome.runtime.connect({ name: "score" });
port.onMessage.addListener(function (msg) {
    console.log(msg);
    let action=msg.action;
    if(action=="closeScorePage"){
        chrome.windows.getAll(null,function(e){
            for(let i=0;i<e.length;i++){
                let state=e[i].state;
                if(state=="normal"){
                    let windowId=e[i].id;
                    chrome.windows.remove(Number(windowId));
                }
            }
        });
        window.close();
    }
});
let html = "";

let score1 = "";
let score2 = "";
let score3 = "";

let url = location.href.match(/score.html\?url=(.*)&/)[1];
let title = location.href.match(/score.html\?url=.*&title=(.*)&/)[1];
let endTime = location.href.match(/score.html\?url=.*&title=.*&endTime=(.*)$/)[1];
if(title){title=decodeURI(title);}
if(endTime){endTime=decodeURI(endTime);}
$(".title").text(title.trim());
$(".url").text(url);


$(".main .score1 img").click(function () {
    let index = $(this).attr("index");
    score1 = Number(index) + 1;
    $(".main .score1 img").attr("src", "../imgs/s2.png");
    for (let i = 0; i < score1; i++) {
        $(".main .score1 img:eq(" + i + ")").attr("src", "../imgs/s1.png");
    }
    console.log(score1);
});

$(".main .score2 img").click(function () {
    let index = $(this).attr("index");
    score2 = Number(index) + 1;
    $(".main .score2 img").attr("src", "../imgs/s2.png");
    for (let i = 0; i < score2; i++) {
        $(".main .score2 img:eq(" + i + ")").attr("src", "../imgs/s1.png");
    }
    console.log(score2);
});

$(".main .score3 img").click(function () {
    let index = $(this).attr("index");
    score3 = Number(index) + 1;
    $(".main .score3 img").attr("src", "../imgs/s2.png");
    for (let i = 0; i < score3; i++) {
        $(".main .score3 img:eq(" + i + ")").attr("src", "../imgs/s1.png");
    }
    console.log(score3);
});


$(".btn").mouseover(function () {
    $(this).css({ "font-size": "33px" });
});

$(".btn").mouseout(function () {
    $(this).css({ "font-size": "30px" });
});


$(".btn").click(function () {
    if (score1 !== "" && score2 !== "" && score3 !== "") {
        console.log(score2);
        port.postMessage({ action: "score", endTime: endTime, score1: score1, score2: score2, score3: score3 });
        setTimeout(function(){window.close();},100);
    } else {
        alert("Please Rate!");
    }
});