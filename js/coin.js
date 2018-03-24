/*! coin functions: ISmith2018  */
setInterval(function () {
    LoadAPIData(global_tickerurl, reloadok);
}, global_interval);

function reloadok() {
    location.reload(forceGet) // reload current page
    console.log("reloaded")
}


function inwatchlist(coin) {
    var coin = coin;
    var index = global_coinlist.indexOf(coin);
    if (index > -1) {
        return true;
    }
    return false;
}

/*  display popup for selected coin by rank (id)-----------------------------------------------  */
function showcoin(i) {
    var rank = i; // find coin obj from its rank then display in the modal
    var value = ""; // triggered by any row clicked on a table

    var result = coinpricearray.filter(function (obj) {
        if (obj.rank == rank) {
            //            console.log(obj.name);
            value += '<div  class="frame" style="border-radius: 10px;"><div>';
            value += '<div style="float:right;width:67%;border: 0px solid #000;text-align:left;padding:2px 0px;line-height:32px;">';
            value += '<span style="font-size: 22px;"><a href="" style="text-decoration: none;">';
            value += obj.name + '(' + obj.symbol + ')';
            if (obj.watchlist) {
                value += '<img src="./images/svg/star.svg" class="img20">';
            }
            value += '</a></span><br>';
            value += '<span style="font-size: 24px;">' + formatCurrency(Number(obj.price_usd));
            value += '</span></div>';
            value += '<div style="text-align:center;padding:auto;width:33%;">';
            value += '<img src="./coinicon/32/color/' + obj.symbol.toLowerCase() + '.png" class="img40" onerror="'
            value += 'this.src=\'./images/missing.svg\'\">';
            value += '</div></div>';
            value += '<div class="frame" style="clear:both;padding:5px;">';
            value += ' <div class="changedata">' + UpDownPopupValue('H: ', obj.percent_change_1h)  + '</div>';
            value += ' <div class="changedata">' + UpDownPopupValue('D: ', obj.percent_change_24h) + '</div>';
            value += ' <div class="changedata">' + UpDownPopupValue('W: ', obj.percent_change_7d)  + '</div>';
            value += '</div>';
            value += '<div class="frame" style="clear:both;">';
            value += ' <div class="title" style="width:30%">RANK<br>' + obj.rank + '</div>';
            value += ' <div class="title" style="width:70%">MARKET CAP<br>' + formatCurrency(Number(obj.market_cap_usd)) + '</div>';
            value += ' </div>';
            value += '<div  class="frame" style="text-align:center;clear:both;font-size:10px;font-style:italic;padding:5px 0;">';
            if (obj.watchlist) {
                value += '<button class="smallbtn" onclick="remove_coin(\'' + obj.symbol + '\')";>Stop Watching</button>';
            } else {
                value += '<button class="smallbtn" onclick="add_coin(\'' + obj.symbol + '\')";>Start Watching</button>';
            }
            value += '</div><div>';

            document.getElementById("coindata").innerHTML = value;

            // Get the modal
            var modal = document.getElementById('popup1');
            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("closemodal")[0];
            span.onclick = function () {
                modal.style.display = "none";
            }
            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal = document.getElementById("popup1");
                    modal.style.display = "none";
                }
            }

            modal.style.display = "block"; // display the modal
            return;
        }
    });

}

// create filter rules functions  ************************************************************

function filterbymarketcap(coin) {
    return coin.rank <= global_numindex;
}

function filterbywatchlistitem(coin) {
    return coin.watchlist;
}

function setfilterwatchlist(coinpricearray) {
    // set watchlist property
    var n = coinpricearray.length
    for (i = 0; i < n; i++) {
        coinpricearray[i].watchlist = inwatchlist(coinpricearray[i].symbol);
    }
}


/*  populate all the coin tables-----------------------------------------------  */
function loadalltables(num) {
    var n = num;
    if (n == undefined) {
        n = global_num;
    };
    requesturl = "https://api.coinmarketcap.com/v1/ticker/?limit=" + n;
    Spinner("ON");
    LoadAPIData(requesturl, PriceTables);
}

function PriceTables(jsonobj) {
    coinpricearray = JSON.parse(jsonobj);
    // add 'watchlist'properyy to all 
    setfilterwatchlist(coinpricearray);
    // make it global/persistant -copy in local storgae (see its its quicker when moving between pages:)
    storeitem('coinpricearray', coinpricearray);

    /* all coins, no summary, not sorted, get markethealth */
    var period = "1H";
    var tablename = "AllCoinsTable";
    var num = global_num;
    tablelbl("AllCoinlbl", "All By Market Cap", num);
    markethealth = 0.00;
    var icons = true; // include icons
    if (global_allicons == "-1") {
        icons = false
    };
    CreateSortableTable(coinpricearray, period, tablename, num, icons, false, true);

    /* top 10 by market cap, on sorting rqd*/
    var period = "1H";
    var tablename = "Top10Table";
    var num = global_smallnum;
    tablelbl("Top10lbl", "Market Cap", num);
    var icons = true; // include icons in small tables
    if (global_icons == "-1") {
        icons = false
    };
    smallarray = coinpricearray.slice(0, global_smallnum);
    CreateSortableTable(smallarray, period, tablename, num, icons, true, false);

    /* watchlist*/
    var period = "1H";
    var tablename = "WatchlistTable";
    var num = 0;
    tablelbl("Watchlistlbl", "Watchlist", num);
    var icons = true; // include icons in small tbales
    if (global_icons == "-1") {
        icons = false
    };
    smallarray = coinpricearray.filter(filterbywatchlistitem);
    CreateSortableTable(smallarray, period, tablename, num, icons, true, false);

    Spinner("OFF");
}

function tablelbl(id, title, num) {
    // eg <h2 id="BigDownlbl">Top 10 Fallers in 1 hour</h2>
    var lblid = id;
    var num = num;
    var title = title; //riser of faller
    if (num == 0) {
        tablelbl = title;
    } else {
        title = title + " (" + num + ")";
    }

    document.getElementById(lblid).innerHTML = title;
}

function LoadAPIData(requesturl, handler) {
    var xmlhttp = new XMLHttpRequest();
    var url = requesturl;
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            handler(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    try {
        xmlhttp.send();
    } catch (error) {
        console.log("caught");

    }

}

function SortCoinArray(period, direction) {
    // not in use
    var period = period;
    var tablename = tablename;
    var direction = direction;
    if (period == undefined || period == "") {
        period = "1H"
    };
    if (tablename == undefined || tablename == "") {
        tablename = "Top10Table"
    };
    if (direction == undefined || direction == "") {
        direction = "DESC"
    };

    if (direction == "DESC") {
        if (period == "1H") {
            coinpricearray.sort(function (a, b) {
                return Number(b.percent_change_1h) - Number(a.percent_change_1h)
            });
        };
        if (period == "1D") {
            coinpricearray.sort(function (a, b) {
                return Number(b.percent_change_24h) - Number(a.percent_change_24h)
            });
        };
    }

    if (direction == "ASC") {
        if (period == "1H") {
            coinpricearray.sort(function (a, b) {
                return Number(a.percent_change_1h) - Number(b.percent_change_1h)
            });
        };
        if (period == "1D") {
            coinpricearray.sort(function (a, b) {
                return Number(a.percent_change_24h) - Number(b.percent_change_24h)
            });
        };
    }
}

function CreateSortableTable(array, period, tablename, num, icons, summary, score) {
    // overloaded - simplify
    var coins = array;
    var totalp = 0.00;
    var totalcap = 0.00;
    var n = num;
    var period = period;
    var tablename = tablename;
    var tableid = "ID_" + tablename;
    var summary = summary;
    var rowcount = 0;
    var scorehealth = score;
    var upcount = 0.00

    if (scorehealth == undefined) {
        scorehealth = false;
    };

    if (n == undefined) {
        n = global_numindex;
    };
    if (n > coins.length || n == 0) {
        n = coins.length;
    };
    if (period == undefined || period == "") {
        period = "1H";
    };
    if (tablename == undefined || tablename == "") {
        tablename = "Top10Table";
    };
    if (summary == undefined) {
        summary = true;
    };

    /* CREATE THE TABLE */

    var target = document.getElementById(tablename);
    var data = "";
    var summarydata = "";
    var rank = "";
    data += "<table class='sortable' id=" + tableid + ">";
    data += "<thead><tr>";
    data += "<th class='mid'>Coin</th>";
    data += "<th class='mid'>Price</th>";
    data += "<th class='narrow'>1h</th>";
    data += "<th class='narrow'>1d</th>";
    data += "<th class='narrow hidemobile'>7d</th>";
    data += "<th class='wide hidemobile'>CAP</th>";
    data += "</tr></thead><tbody>";

    for (i = 0; i < n; i++) {
        rank = coins[i];
        data += "<tr onclick=showcoin(" + coins[i].rank + ")>";
        data += "<td class='mid'>";
        data += coins[i].name;
        if (icons) {
            data += "<br class='smallbr'><img src='./coinicon/32/color/";
            data += coins[i].symbol.toLowerCase() + ".png' class='img32' onerror="
            data += "\"this.src=\'./images/missing.svg\'\">";
        };
        data += "<br class='smallbr'>(" + coins[i].symbol + ")";
        if (coins[i].watchlist) {
            data += "<img src='./images/svg/watchgold.svg' class='img20'";
        }
        data += "</td>";


        data += "<td class='mid'>" + formatCurrency(Number(coins[i].price_usd)) + "</td>";
        data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_1h)) + formatpercent(coins[i].percent_change_1h) + "</td>";
        data += "<td class='narrow" + checkchange(Number(coins[i].percent_change_24h)) + formatpercent(coins[i].percent_change_24h) + "</td>";
        data += "<td class='narrow hidemobile" + checkchange(Number(coins[i].percent_change_7d)) + formatpercent(coins[i].percent_change_7d) + "</td>";
        data += "<td class='wide hidemobile'>" + formatCurrency(Number(coins[i].market_cap_usd)) + "</td>";
        data += '</tr>';
        totalp += Number(coins[i].price_usd);
        totalcap += Number(coins[i].market_cap_usd);

        rowcount += 1;
        if (Number(coins[i].percent_change_1h) > 0.00) {
            upcount += 1;
        }
    }

    data += "</tbody></table>";
    if (summary) {
        summarydata += "<table class= 'summary'><thead><tr>";
        summarydata += "<th class='narrow'>Price</th>";
        summarydata += "<th class='mid'>Market CAP</th>";
        summarydata += "</tr></thead><tbody><tr>";
        summarydata += "<td class='narrow'>" + formatCurrency(totalp) + "</td>";
        summarydata += "<td class='mid'>" + formatCurrency(totalcap) + "</td>";
        summarydata += "</tr></tbody><tfoot></tfoot></table>";
        data = summarydata + data;
    }

    /* data = data + "<P>Row count: " + rowcount + "<P>";  */
    target.innerHTML = data;
    sorttable.makeSortable(document.getElementById(tableid));

    if (scorehealth) {
        markethealth = (100 * upcount / rowcount);
        var temp = '';
        temp += markethealth + "% " + "<img src='./images/good.png' style='height:21px'>";
        temp += (100 - Number(markethealth)) + "% " + "<img src='./images/bad.png' style='height:21px'>";
        document.getElementById("markethealth").innerHTML = temp;
    }
    addfooter();
}

/*  loader gif-----------------------------------------------  */
function Spinner(state) {
    var newstate = state;
    var spin = document.getElementById("spinner");
    if (newstate == 'ON') {
        spin.style.display = "block";
    } else {
        spin.style.display = "none";
    }
}

/*  formatting-----------------------------------------------  */
function formatCurrency(num) {
    if (num === null) {
        num = "0";
    }
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
        num = "0";
    }

    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();

    if (cents < 10) {
        cents = "0" + cents;
    }
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    }

    return (((sign) ? '' : '-') + '$' + num + '.' + cents);
}

function formatpercent(pcnt) {
    var string;
    var percent = pcnt;
    if (percent === null) {
        percent = "0.00";
    }
    string = percent;
    return string;
}

function checkchange(pcnt) {
    // used in tables
    var UpDown = "'>";
    var percent = pcnt;
    if (percent === null) {
        UpDown = "'>";
    } else if (percent < 0) {
        UpDown = " isDown'>";
    } else if (percent >= 0) {
        UpDown = " isUp'>";
    }
    return UpDown;
}

function UpDownPopupValue(label, pcnt) {
    // used in popup
    var label = label;
    var percent = formatpercent(pcnt);
    var string = "";

    if (percent === null) {
        string += "<span>" + percent + "</span>";
    } else if (percent < 0) {
        string = "<span class='isDown'>" + label +  percent + "</span>";
    } else if (percent >= 0) {
        string = "<span class='isUp'>" +  label +  percent + "</span>";
    }

    return string;
}



function ToLowerCase(str) {

    // not used
    var string = str;
    return string.toLowerCase();
}

/*  page footer----------------------------------------------  */
function addfooter() {
    var value = '';
    value += "<div class='footer'>";
    value += "<div class='footer-R-inner'><a href='#' target='_404.html'>IanSmith.IT</a></div>";
    value += "<div class='footer-L-inner'>Version 1.1.2 GOLD </a></div>";
    value += "</div>";

    document.getElementById("footer").innerHTML = value;
}

/*  page tabs -----------------------------------------------  */
function openprice(evt, priceName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("price");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-border-red", "");
    }
    document.getElementById(priceName).style.display = "block";
    evt.currentTarget.firstElementChild.className += " w3-border-red";
}

function openTab(priceName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("price");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(priceName).style.display = "block";
}


// not yet in use
function menu() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}


// search a table
function searchtable() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("ID_AllCoinsTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}


function clearinput(control) {
    var that = document.getElementById(control);
    that.value = "";
    searchtable();
}