/*! coin functions: ISmith2018  */
/* ---- global and default declaration-------  */
getglobalsettings();


/*  global_xxxxxxxx: settings page coins-------------------------------------------------------------  */
function getglobalsettings() {
    // get these/set from local storage when loading the any page
    coinpricearray = getitem('coinpricearray', []); // TES coinlist. refreshed on successful api call
    global_num = getitem('global_num', "100"); // how many in total to load?
    global_smallnum = getitem('global_smallnum', "10"); // load top '10's
    global_interval = getitem('global_interval', "300000"); //5mins in miliseconds
    global_icons = getitem('global_icons', "1"); // show icons in  (use -1 for false)
    global_allicons = getitem('global_allicons', "1"); // show icons everywhere
    global_numindex = getitem('global_numindex', "10"); // index, how many coins to count in summary
    global_tickerurl = getitem('global_tickerurl', "https://api.coinmarketcap.com/v1/ticker/?limit="); + global_num; // watchlist

    // defaultwatchlist = ["BTC", "ETH", "BCH", "XRP", "LTC"]  // top 5 by market cap
    global_coinlist = getitem('global_coinlist', ["BTC", "ETH", "BCH", "XRP", "LTC"]); // default watchlist (note: Object) 

    global_currency = getitem('global_currency', "USD"); // not used yet.

}

/* ------ functions for settngs ---- */

function setdefault(btngroup) {
    // set the controls for settings page
    var groupitem = document.getElementsByName(btngroup);
    var defaultvalue = getitem(btngroup);
    for (var i = 0; i < groupitem.length; i++) {
        groupitem[i].checked = false; // all false
        if (groupitem[i].value == defaultvalue) {
            groupitem[i].checked = true; // only one true
        }
    }
}

function changesettings(btngroup) {
    // radio buttons in settings page. make sure btngroup is named same as global variable to store
    var groupitem = document.getElementsByName(btngroup);
    var value;
    // find value of checked btn in the group
    for (var i = 0; i < groupitem.length; i++) {
        if (groupitem[i].checked) {
            value = groupitem[i].value;
            // update localstorage
            storeitem(btngroup, value);
        }
    }
}

/* ----  get/set global item (or set default) ---- */
function getitem(item, defaultvalue) {
    // get the item frm localstorage
    var value = defaultvalue;
    try {
        value = JSON.parse(localStorage.getItem(item));
    } catch (error) {
        // store the default value for next time
        value = defaultvalue;
        storeitem(item, defaultvalue);
    }
    if (value == null) {
        value = defaultvalue;
        storeitem(item, defaultvalue);
    }
    return value;
}

function storeitem(item, value) {
    // save an item to local storgage
    localStorage.setItem(item, JSON.stringify(value))
}



/*  global_coinlist: for favourite coins-------------------------------------------------------------  */


function add_coin(symbol) {
    // if obj.symbol is passed in use it 
    // else get symbol from user input
    var maybe = "";
    if (symbol == undefined) {
        var ul = document.getElementById("coin-list");
        var candidate = document.getElementById("candidate");
        candidate.value = candidate.value.toUpperCase();
        var li = document.createElement("li");
        var length = candidate.value.length;
        maybe = candidate.value;
    } else {
        maybe = symbol;
    }

    if (maybe) {
        // update global_coinlist & local storage... dont add duplicates... dont add if not found
        var index = global_coinlist.indexOf(maybe); // index -1 means not found
        if (index == -1) {
            for (var i in coinpricearray) {
                if (coinpricearray[i].symbol == maybe) {
                    global_coinlist.push(maybe);
                    storeitem('global_coinlist', global_coinlist);
                    coinpricearray[i].watchlist = true;
                    rank = coinpricearray[i].rank
                    if (symbol == undefined) {
                        candidate.value = "";
                        location.reload(true); // reload current page
                        displaywatchlist();
                    } // only for wishlist screen
                    else {
                        location.reload(true); // reload current page
                        showcoin(rank); // the popup
                    }
                }
            }
        }

    }
}

function remove_coin(symbol) {
    // if obj.symbol is passed in use it 
    // else get symbol from user input
    var maybe = "";
    if (symbol == undefined) {
        var ul = document.getElementById("coin-list");
        var candidate = document.getElementById("candidate");
        maybe = candidate.value.toUpperCase();
    } else {
        maybe = symbol;
    }

    if (maybe) {
        // update global_coinlist & local storage...
        var index = global_coinlist.indexOf(maybe);
        if (index > -1) {
            global_coinlist.splice(index, 1);
            storeitem('global_coinlist', global_coinlist);
        }
        // update the globaal coinlist
        var n = coinpricearray.length;
        for (i = 0; i < n; i++) {
            if (coinpricearray[i].symbol == maybe) {
                rank = coinpricearray[i].rank;
                coinpricearray[i].watchlist = false;
            }
        }

        if (symbol == undefined) {
            candidate.value = "";
            location.reload(true); // reload current page
            displaywatchlist();
        } else {
            location.reload(true); // reload current page
            showcoin(rank);
        }
    }
}
