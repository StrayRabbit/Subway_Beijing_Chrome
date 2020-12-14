var timer = localStorage.timer;         //循环间隔
var timeSlot = localStorage.timeSlot;     //预约时间段
var startTime = localStorage.startTime;      //开抢时间
var loop;       //循环
var baseUrl = 'https://webapi.mybti.cn';
var token = window.localStorage.getItem('yycx-a-token');
var lineName = getQueryStringByUrl(window.location.href, 'lineName');   //几号线
var stationName = getQueryStringByUrl(window.location.href, 'stationName');     //地铁站
var enterDate = getdate(1);     //预约的地铁日期
var count;


$(function () {
    if (window.location.href.indexOf('selecttime') >= 0) {
        // 添加开始按钮
        initControls();

        //加载历史 开抢时间
        if (localStorage.startTime) {
            var date = new Date(localStorage.startTime);

            var h = date.getHours();
            var min = date.getMinutes();
            var s = date.getSeconds();
            var ms = date.getMilliseconds();

            $('#startTime').val(getdate(0) + ' ' + p(h) + ':' + p(min) + ':' + p(s) + '.' + p(ms));
        }
        else {
            $('#startTime').val(getdate(0) + ' 11:59:59.500');
        }

        //加载历史 时间段
        if (localStorage.timeSlot) {
            $('#timeSlot').val(localStorage.timeSlot);
        }
        else {
            $('#timeSlot').val("0730-0740");
        }
    }
});

//定时器
function interval() {
    try {
        //开抢
        if (new Date() >= new Date(startTime)) {
            if (count > 0) {
                createAppointment();
                count--;
            }
            else {
                clearLoop();
            }


        }
    } catch (error) {
        console.log(getCurrentDate() + error);
        clearLoop();
    }
}

function createAppointment() {
    var array = timeSlot.split(/,|，|\s+/);        //逗号分隔

    if (array.length > 0) {
        $.each(array, function (index, val) {
            var data = {
                "lineName": lineName, "snapshotWeekOffset": 0, "stationName": stationName, "enterDate": enterDate.replaceAll('-', ''),
                "snapshotTimeSlot": "0630-0930", "timeSlot": val
            };

            try {
                //地鐵預約
                $.ajax({
                    type: "POST",
                    url: baseUrl + '/Appointment/CreateAppointment',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", token);
                    },
                    success: function (result) {
                        //{balance: 82, appointmentId: "00154ee5", stationEntrance: "A2口"}

                        if (result.balance > 0) {
                            console.log(getCurrentDate() + ' [第' + ($('#count').val() - count) + '次] [' + val + '] 预约成功!');
                            clearLoop();
                            return;
                        }
                        else {
                            console.log(getCurrentDate() + ' [第' + ($('#count').val() - count) + '次] [' + val + '] 预约失败!');
                        }
                    },
                    error: function (result) {
                        console.log(getCurrentDate() + ' [第' + ($('#count').val() - count) + '次] [' + val + '] 预约失败!' + JSON.stringify(result));
                    }
                });
            } catch (error) {
                console.log(getCurrentDate() + ' [' + val + '] 预约失败!' + error);
            }
        });
    }
}

/**
*
* 获取当前时间
*/
function p(s) {
    return s < 10 ? '0' + s : s;
}

function getdate(day) {
    var dayTime = day * 24 * 60 * 60 * 1000; //参数天数的时间戳
    var nowTime = new Date().getTime(); //当天的时间戳
    var myDate = new Date(nowTime + dayTime); //把两个时间戳转换成普通时间

    //获取当前年
    var year = myDate.getFullYear();
    //获取当前月
    var month = myDate.getMonth() + 1;
    //获取当前日
    var date = myDate.getDate();
    var now = year + '-' + p(month) + "-" + p(date);
    return now;
}

function getCurrentDate() {
    var date = new Date();

    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var min = date.getMinutes();
    var s = date.getSeconds();
    var ms = date.getMilliseconds();
    var str = y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + ' ' + (h < 10 ? ('0' + h) : h) + ':' + (min < 10 ? ('0' + min) : min) + ':' + (s < 10 ? ('0' + s) : s) + '.' + p(ms);
    return str;
}

//初始化html
function initControls() {
    var html = '<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;预约日期：' + getdate(1) + '&nbsp;&nbsp;';
    html += '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;预约時間：<input type="text" style="width:150px;" id="timeSlot"  />';
    html += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;开抢时间：<input type='text' style='width:150px;' id='startTime' />&nbsp;&nbsp;";
    html += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;刷新间隔：<input type='text' style='width:150px;' id='timer' value='1100' />&nbsp;&nbsp;毫秒";
    html += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;开抢次数：<input type='text' style='width:150px;' id='count' value='8' />&nbsp;&nbsp;次";
    html += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='button' id='btnInterval' value='开始' style='WIDTH: 72px; HEIGHT: 24px' /></div><br />";
    $(".content").before(html);

    $("#btnInterval").bind("click", function () {
        timeSlot = $('#timeSlot').val();
        timer = $("#timer").val();
        count = $('#count').val();
        startTime = $('#startTime').val();

        if (!timeSlot) {
            alert('请您先设置预约时间!');
            return;
        }

        if (!timer) {
            alert('请您先设置刷新间隔!');
            return;
        }

        localStorage.timer = timer;
        localStorage.timeSlot = timeSlot;
        localStorage.startTime = startTime;

        console.log('开抢时间：' + startTime + ',' + lineName + '，' + stationName + '，预约日期：' + enterDate + '，时间段：' + timeSlot);

        //暂停
        if (sessionStorage.Isloop == 1) {
            clearLoop();      //关闭定时器
        }
        //开始
        else {
            setLoop();
        }
    });
}

//不循环
function clearLoop() {
    sessionStorage.Isloop = 0;
    count = 0;
    clearInterval(loop);      //关闭定时器
    $("#btnInterval").val('开始');
}

//开始循环
function setLoop() {
    clearInterval(loop);
    sessionStorage.Isloop = 1;
    loop = setInterval(interval, timer);
    $("#btnInterval").val('暂停');
}

//截取url的参数值  
function getQueryStringByUrl(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    var r = url.substr(url.indexOf("?")).substr(1).match(reg);
    if (r != null)
        return decodeURI(r[2]);
    return null;
}

//比较时间大小
function checkTime(startTime, endTime) {
    var start = new Date(startTime.replace("-", "/").replace("-", "/"));
    var end = new Date(endTime.replace("-", "/").replace("-", "/"));
    console.log(start);
    console.log(end);
    if (start >= end) {
        return true;
    }
    return false;
}

//监听消息
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     //popup初始化参数
//     if (request.cmd == 'initData') {
//         sendResponse({ km: localStorage.km, ks: localStorage.ks, timer: localStorage.timer });
//     }

//     //参数赋值
//     if (request.cmd == 'save') {
//         console.log(request.timer + "|" + request.km + "|" + request.ks);

//         localStorage.timer = request.timer;
//         localStorage.km = request.km;
//         localStorage.ks = request.ks;

//         timer = localStorage.timer;
//         km = localStorage.km;
//         ks = localStorage.ks;
//         sendResponse('保存成功!');
//     }
// });