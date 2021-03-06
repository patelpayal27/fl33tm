const ipcRenderer = require("electron").ipcRenderer;
const path = require('path')
const url = require('url')
const os = require("os");
const fs = require("fs");
const remote = require('electron').remote
//const dialog = remote.require('dialog'); 
const {dialog,shell} = require('electron').remote;


/* Global Vars */
g_cityDivItem = null;

function sleep(milliseconds) {
    for (var i = 0; i < 1000; i++) {
        null;
    }
}

//******* Region Login, Dashboard ********
function bindLoginEvents() {
    $('#btnSettings').click(function(){ loaddialog('#dialogSettings'); });
    $('#btnSaveSettings').click(function(){
        var settingsObj = new Object();
        var serverSettingsObj = new Object();
        settingsObj.serverName = $("#txtServerName").val();
        settingsObj.serverDesc = $("#txtServerName").val();
        serverSettingsObj.serverSettings = settingsObj;
        var jsonContent = JSON.stringify(serverSettingsObj, null, 4);
        try { 
            fs.writeFileSync('settings.json', jsonContent, 'utf-8');
            showSnackbar("Settings saved successfully");
            closeDialog("#dialogSettings");
        }
        catch(e) { showSnackbar('Failed to save settings !'); }
    });
    $('#aNewUser').click(function(){ loaddialog('#dialogNewUser'); });
    $('#btnExit').click(function(){ exitApp() });
    checkNLoadSettings();
}

function loadLogin() {
    //For TESTing
    preloaderGif(true, "body");
    setTimeout(function(){preloaderGif(false, "body");},10000);
    //Till here For TESTing

    $('#container').load('./login.html', function(){
        componentHandler.upgradeAllRegistered();
    });
}

function preloaderGif(showflag, controlName){
    if(showflag){
        $(controlName).removeClass('loader-hide').addClass('loader-show');
        $('body').append('<div id="overDiv" style="position:absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;)"></div>');
    }
    else{
        $(controlName).removeClass('loader-show').addClass('loader-hide');
        $("#overDiv").remove();
    }
}

function showPreloader(i_eleId){
    if($(i_eleId + ' > #preloader').length < 1){
        $(i_eleId).prepend("<div id=\"preloader\" class=\"preloader-overlay\"></div>");
    }
    $(i_eleId + ' > #preloader').css("display", "block");
}

function hidePreloader(i_eleId){
    i_eleId = i_eleId + ' > #preloader'
    $(i_eleId).css("display", "none");
}

function checkNLoadSettings(){
    if(!checkFileExists('./settings.json')){
        loaddialog('#dialogSettings');
    }
    else{
        fs.readFile('./settings.json', 'utf-8', function (err, JsonData) {
            if (err) {
                return alert(err);
            }
            
            var resData = JSON.parse("[" + JsonData + "]");
            resData.forEach(function(element) {
                $("#txtServerName").val(element.serverSettings.serverName);
            }, this);
    
            checkDirty_textfield();
        });
    }
}

function loginUser() {
    //window.location="index.html";
    loadDashboard();
    /*
    $('#loginErrMsg').text("");
    var userId = $('#userId').val();
    var userPass = $('#userPass').val();
    if( userId == "" || userPass == "") {
        if(userId == ""){
            $('#userIdDiv').addClass("is-invalid");
        }
        if(userPass == ""){
            $('#userPassDiv').addClass("is-invalid");
        }        
    }
    else if( userId != "" && userPass != "") {
        var reqJson = JSON.stringify({
                    user_id:userId,
                    user_pass:$.sha256(userPass)
                })
        showPreloader("#container");
        callWebService(
            'POST',
            'http://localhost:5000/user/authenticate',
            reqJson,
            function (resJO){
                if(resJO.status == "failed"){
                    $('#loginErrMsg').text("User Login Failed. Invalid Username Password !!");
                    $('#userPass').val("");
                }
                else {
                    loadDashboard();
                }
                hidePreloader("#container");
            },
            function (){
                hidePreloader("#container");
            }
        )
	}*/
}

function loadDashboard(){
    $('#container').load('./dashboard.html', function(){
        componentHandler.upgradeAllRegistered();
        $('#user-page-content').load('dashboard_content.html', function(){
            //loadFlatpickr();
            componentHandler.upgradeAllRegistered();
            loadGraph();
        });
    });

    $( ".mdl-layout__drawer" ).bind( "click", function() {
        $( ".mdl-layout" )[0].MaterialLayout.toggleDrawer();
    });
}

function loadUserPageContent(el){
    $('#user-page-content').load($(el).data('pageurl'), function(){
        $('#user-page-header').text($(el).data('pageheader'));
        componentHandler.upgradeAllRegistered();
        loadFlatpickr();
    });

    $( ".mdl-layout" )[0].MaterialLayout.toggleDrawer();
}

function loadGraph() {
    var svg = d3.select("svg"),
        margin = {top: 30, right: 30, bottom: 30, left:30},
        width =  $("#dashGraph").width() - margin.left - margin.right,
        height = $("#dashGraph").height() - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%d-%b-%y");

    var x = d3.scaleTime()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

    d3.tsv("data.tsv", function(d) {
    d.date = parseTime(d.date);
    d.close = +d.close;
    return d;
    }, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });
}

function logoutUser() {
    loadLogin();
    showSnackbar("You have logged out successfully.");
}

function exitApp() {
    remote.getCurrentWindow().close()
}
//******* End Region Login, Dashboard ********

//******* Region G.R. Book *******
function showSearchResult() {
    //For TESTing
    preloaderGif(true, "#SearchResultPanel");
    setTimeout(function(){preloaderGif(false, "#SearchResultPanel");},10000);
    //Till here For TESTing

    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        var srchPanel = $("#SearchResultPanel");
        srchPanel.empty();
        var resDataJson = '[{"gr_no":"100","gr_date":"3-Jan-2017","from_city":"Mumbai","to_city":"Pune","consigner_name":"Aditya Toshniwal","consignee_name":"Payal Patel","vehicle_no":"XXXX XX 2519","total_amt":"123456789"}, {"gr_no":"101","gr_date":"3-Jan-2017","from_city":"Mumbai","to_city":"Pune","consigner_name":"Parshwa Shah","consignee_name":"Payal Patel","vehicle_no":"XXXX XX 2519","total_amt":"123456789"}, {"gr_no":"102","gr_date":"3-Jan-2017","from_city":"Mumbai","to_city":"Pune","consigner_name":"Payal Patel","consignee_name":"Payal Patel","vehicle_no":"XXXX XX 2519","total_amt":"123456789"}, {"gr_no":"103","gr_date":"3-Jan-2017","from_city":"Mumbai","to_city":"Pune","consigner_name":"Rachit Bhatnagar","consignee_name":"Payal Patel","vehicle_no":"XXXX XX 2519","total_amt":"123456789"}, {"gr_no":"104","gr_date":"3-Jan-2017","from_city":"Mumbai","to_city":"Pune","consigner_name":"Bhumika Sanghvi","consignee_name":"Payal Patel","vehicle_no":"XXXX XX 2519","total_amt":"123456789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            //Get month from gr_date
            var gr_date = new Date(element.gr_date);//2017-01-03 OR 3-Jan-2017 - Will work
            var month = gr_date.getMonth() + 1; // Month is returned as 0-11
            var longMonthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(gr_date);// "July"
            var shortMonthName = new Intl.DateTimeFormat("en-US", { month: "short" }).format(gr_date);// "Jul"
            //Get year from gr_date
            var year = gr_date.getFullYear();
            //Get date from gr_date
            var date = gr_date.getDate();

            var divEl = `
            <div class="mdl-grid mdl-grid--no-spacing grsearch-item" data-gr_no="`+element.gr_no+`">
                <div class="mdl-cell mdl-cell--1-col grsearch-date">
                    <div class="grsearch-date-month">`+date+` `+shortMonthName+`</div>
                    <div class="grsearch-date-year">`+year+`</div>
                </div>
                <div class="mdl-cell mdl-cell--9-col grsearch-main">
                    <div class="mdl-grid mdl-grid--no-spacing">
                        <div class="mdl-cell mdl-cell--10-col">
                            <span class="grsearch-grno">`+element.gr_no+`</span>&nbsp;&nbsp;
                            <span>`+element.from_city+` -> `+element.to_city+`</span>
                        </div>
                    </div>
                    <div class="mdl-grid mdl-grid--no-spacing">
                        <div class="mdl-cell mdl-cell--10-col">
                            <span>Consigner : `+element.consigner_name+`</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                            <span>Consignee : `+element.consignee_name+`</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                            <span>Vehicle No. : `+element.vehicle_no+`</span>
                        </div>
                    </div>
                </div>
                <div class="mdl-cell mdl-cell--2-col grsearch-total">
                    <img src="../images/rupee.svg" alt="Rs." style="width:10px;height:15px;">
                    <span> `+element.total_amt+`</span>
                </div>
            </div>`;
            srchPanel.append(divEl);
        }, this);

        $(".grsearch-item").on("click",function(){showGrDialog($(this).data("gr_no"));});

    //     }
    // );    
}

function showGrDialog(i_grNo) {
    $('#divDialogHeader').text('G. R. Book Entry');
    $('#divDialogContent').load('grbook.html', function(){
        componentHandler.upgradeAllRegistered();
        loadFlatpickr();
        loadDropDowns();
        loadGRData();
        $('[tabindex=1]').focus();
    });
    $('#divGrDialog')[0].showModal();
}

function loadDropDowns(){
    //// loadCityDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selFromCity").children().remove();
        $("#selFromCity").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "city_id":1, "city_name":"Mumbai" },{ "city_id":2, "city_name":"Pune" },{ "city_id":3, "city_name":"Ahmedabad" },{ "city_id":4, "city_name":"Bangalore" },{ "city_id":5, "city_name":"Delhi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selFromCity").append('<option value=' + element.city_id + '>' + element.city_name + '</option>');
        }, this);
    //     }
    // );

    //// loadDestinationDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selDestination").children().remove();
        $("#selDestination").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "city_id":1, "city_name":"Mumbai" },{ "city_id":2, "city_name":"Pune" },{ "city_id":3, "city_name":"Ahmedabad" },{ "city_id":4, "city_name":"Bangalore" },{ "city_id":5, "city_name":"Delhi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selDestination").append('<option value=' + element.city_id + '>' + element.city_name + '</option>');
        }, this);
    //     }
    // );

    //// loadDriverNameDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selDriverName").children().remove();
        $("#selDriverName").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "driver_id":1, "driver_name":"Payal Patel" },{ "driver_id":2, "driver_name":"Aditya Toshniwal" },{ "driver_id":3, "driver_name":"Parshwa Shah" },{ "driver_id":4, "driver_name":"Rachit Bhatnagar" },{ "driver_id":5, "driver_name":"Bhumika Sanghvi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selDriverName").append('<option value=' + element.driver_id + '>' + element.driver_name + '</option>');
        }, this);
    //     }
    // );

    //// loadVehicleNoDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selVehicleNo").children().remove();
        $("#selVehicleNo").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "vehicle_id":1, "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":2, "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":3, "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":4, "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":5, "vehicle_no":"XXX XXXX 2519" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selVehicleNo").append('<option value=' + element.vehicle_id + '>' + element.vehicle_no + '</option>');
        }, this);
    //     }
    // );

    //// loadGRTypeDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selGRType").children().remove();
        $("#selGRType").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "gr_type_id":1, "gr_type_desc":"GRType 1" },{ "gr_type_id":2, "gr_type_desc":"GRType 2" },{ "gr_type_id":3, "gr_type_desc":"GRType 3" },{ "gr_type_id":4, "gr_type_desc":"gr_type 4" },{ "gr_type_id":5, "gr_type_desc":"GRType 5" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selGRType").append('<option value=' + element.gr_type_id + '>' + element.gr_type_desc + '</option>');
        }, this);
    //     }
    // );

    //// loadTLTypeDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selTL").children().remove();
        $("#selTL").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "tl_id":1, "tl_name":"TL 1" },{ "tl_id":2, "tl_name":"TL 2" },{ "tl_id":3, "tl_name":"TL 3" },{ "tl_id":4, "tl_name":"TL 4" },{ "tl_id":5, "tl_name":"TL 5" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selTL").append('<option value=' + element.tl_id + '>' + element.tl_name + '</option>');
        }, this);
    //     }
    // );

    //// loadPriorityDD() ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        $("#selPriority").children().remove();
        $("#selPriority").append('<option selected disabled hidden value=""></option>');
        var resDataJson = '[{ "pri_id":1, "pri_name":"Lowest" },{ "pri_id":2, "pri_name":"Low" },{ "pri_id":3, "pri_name":"Normal" },{ "pri_id":4, "pri_name":"High" },{ "pri_id":5, "pri_name":"Highest" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            $("#selPriority").append('<option value=' + element.pri_id + '>' + element.pri_name + '</option>');
        }, this);
    //     }
    // );

    getConsignData();
}

function loadGRData(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

            var resDataJson = '[{"gr_no":1,"branch_code":"Mumbai","st_paid_by":"Consignee","gr_date":"01/01/2017","from_city_id":"1","dest_city_id":"2","driver_id":"3","vehicle_id":"4","consigner_id":1,"consignee_id":2,"gr_type_id":"3","freight":165,"cover_charge":5000,"door_delivery":4000,"statistical_charge":1000,"risk_charge":500,"service_tax":800,"green_tax":500,"total":50000,"total_packages":100,"tl_id":"2","party_inv":"PartyInvoice XYZ","party_inv_date":"01012016","remarks":"Remarks XYZ","pri_id":"5","pack_material_details":[{"pkg_method":"Method XYZ","pkg_desc":"Description XYZ","pkg_wt":"3000","pkg_rate":"5000","pkg_mark":"4545","pkg_cft":"CFT XYZ"},{"pkg_method":"Method ABC","pkg_desc":"Description ABC","pkg_wt":"3000","pkg_rate":"5000","pkg_mark":"4545","pkg_cft":"CFT ABC"},{"pkg_method":"Method PQR","pkg_desc":"Description PQR","pkg_wt":"3000","pkg_rate":"5000","pkg_mark":"4545","pkg_cft":"CFT PQR"},{"pkg_method":"Method 123","pkg_desc":"Description 123","pkg_wt":"3000","pkg_rate":"5000","pkg_mark":"4545","pkg_cft":"CFT 123"},{"pkg_method":"Method 456","pkg_desc":"Description 456","pkg_wt":"3000","pkg_rate":"5000","pkg_mark":"4545","pkg_cft":"CFT 456"}]}]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#txtGrNo").val(element.gr_no);
                $("#txtBranchCode").val(element.branch_code);
                $('input:radio[name="options"][value="' + element.st_paid_by + '"]').parent().addClass('is-checked');
                $("#txtGrDate").val(element.gr_date);
                $("#selFromCity").val('' + element.from_city_id + '');
                $("#selDestination").val('' + element.dest_city_id + '');
                $("#selDriverName").val('' + element.driver_id + '');
                $("#selVehicleNo").val('' + element.vehicle_id + '');
                $("#txtConsignerName").val(element.consigner_id);
                
                var consignData = JSON.parse(consignDataJson);
                consignData.forEach(function(element1) {
                    if(element.consigner_id == element1.consign_id){
                        $("#txtConsignerName").val(element1.consign_name);
                        $("#divAddressConsigner").text(element1.consign_addr);
                        $("#divAddressConsigner").append('<br/>' + element1.consign_cntct);
                    }
                    if(element.consignee_id == element1.consign_id){
                        $("#txtConsigneeName").val(element1.consign_name);
                        $("#divAddressConsignee").text(element1.consign_addr);
                        $("#divAddressConsignee").append('<br/>' + element1.consign_cntct);
                    }
                }, this);

                $("#selGRType").val('' + element.gr_type_id + '');
                $("#txtFreight").val(element.freight);
                $("#txtSomething").val(element.freight);
                $("#txtCoverCharge").val(element.cover_charge);
                $("#txtDoorDeliveryCharge").val(element.door_delivery);
                $("#txtStatisticalCharge").val(element.statistical_charge);
                $("#txtRiskCharge").val(element.risk_charge);
                $("#txtServiceTax").val(element.service_tax);
                $("#txtGreenTax").val(element.green_tax);
                $("#txtTotal").val(element.total);
                $("#txtTotPkgs").val(element.total_packages);
                // $("#txtActualWt").val(element.ActWt);
                // $("#txtChgWt").val(element.ChgWt);
                // $("#txtRate").val(element.Rate);
                $("#selTL").val(element.tl_id);
                $("#txtPartyInv").val(element.party_inv);
                $("#txtPartyInvDate").val(element.party_inv_date);
                $("#txtRemarks").val(element.remarks);
                $("#selPriority").val(element.pri_id);

                element.pack_material_details.forEach(function(pmd_data) {
                    addPackageToList(pmd_data.pkg_method, pmd_data.pkg_desc, pmd_data.pkg_wt, pmd_data.pkg_rate, pmd_data.pkg_mark, pmd_data.pkg_cft);
                }, this);

                checkDirty_textfield();
            }, this);
    //     }
    // );
}

function addPackageToList(method, desc, actualwt, rate, chgwt, cft) {
    if(method == null){
        method = $("#packageAddPanel1 #txtMethod").val();
    }
    if(desc == null){
        desc = $("#packageAddPanel1 #txtDesc").val();
    }
    if(actualwt == null){
        actualwt = $("#packageAddPanel2 #txtActualWt").val();
    }
    if(rate == null){
        rate = $("#packageAddPanel2 #txtRate").val();
    }
    if(chgwt == null){
        chgwt = $("#packageAddPanel2 #txtChgWt").val();
    }
    if(cft == null){
        cft = $("#packageAddPanel2 #txtCft").val();
    }

    var packList = $("#packageList");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--8-col">
                <div style="font-size:18px">
                    <span id="lstPackMeth">`+method+`</span>-<span id="lstPackDesc">`+desc+`</span>
                </div>
                <div>
                    <span class="fleet-color-text">Actual Wt. :</span><span id="lstPackActWt">`+actualwt+`</span>&nbsp;|&nbsp;
                    <span class="fleet-color-text">Rate :</span><span id="lstPackRate">`+rate+`</span>&nbsp;|&nbsp;
                    <span class="fleet-color-text">P. Marks :</span><span id="lstPackPmarks">`+chgwt+`</span>&nbsp;|&nbsp;
                    <span class="fleet-color-text">CFT :</span><span id="lstPackCft">`+cft+`</span>
                </div>
            </div>
            <div class="mdl-cell mdl-cell--3-col" style="text-align:right">
                <span id="lstPackTotal" style="font-size:18px"><strong>0000000</strong></span>
            </div>
            <div class="mdl-cell mdl-cell--1-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>            
        </div>`;
    packList.append(divEl);
    packList.scrollTop(1E10);
}

function getConsignData() {
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        var divConsignerData = $("#divConsignerData");
        divConsignerData.empty();
        var divConsigneeData = $("#divConsigneeData");
        divConsigneeData.empty();

        consignDataJson = '[{"consign_id":1, "consign_name":"Payal Patel", "consign_addr":"Payal, Grant Road, Mumbai, 400007", "consign_cntct":"9725586862"},{ "consign_id":2, "consign_name":"Aditya Toshniwal", "consign_addr":"Aditya, Grant Road, Mumbai, 400007", "consign_cntct":"9123123123"},{ "consign_id":3, "consign_name":"Parshwa Shah", "consign_addr":"Parshwa, Grant Road, Mumbai, 400007", "consign_cntct":"9456456456"},{ "consign_id":4, "consign_name":"Rachit Bhatnagar", "consign_addr":"Rachit, Grant Road, Mumbai, 400007", "consign_cntct":"9789789789"},{ "consign_id":5, "consign_name":"Bhumika Sanghvi", "consign_addr":"Bhumika, Grant Road, Mumbai, 400007", "consign_cntct":"9010101010"}]';
        var resData = JSON.parse(consignDataJson);
        resData.forEach(function(element) {
            var divEl = `
            <div class="mdl-grid data-list-item grsearch-item" data-consigner_id="`+element.consign_id+`" data-consigner_name="`+element.consign_name+`" data-consigner_addr="`+element.consign_addr+`" data-consigner_cntct="`+element.consign_cntct+`">
                <div class="mdl-cell mdl-cell--11-col">
                    <div><span style="font-size:18px">`+element.consign_name+`</span></div>
                    <div><span style="font-size:12px">`+element.consign_addr+` - `+element.consign_cntct+`</span></div>
                </div>
            </div>`;
            divConsignerData.append(divEl);

            divEl = `
            <div class="mdl-grid data-list-item grsearch-item" data-consignee_id="`+element.consign_id+`" data-consignee_name="`+element.consign_name+`" data-consignee_addr="`+element.consign_addr+`" data-consignee_cntct="`+element.consign_cntct+`">
                <div class="mdl-cell mdl-cell--11-col">
                    <div><span style="font-size:18px">`+element.consign_name+`</span></div>
                    <div><span style="font-size:12px">`+element.consign_addr+` - `+element.consign_cntct+`</span></div>
                </div>
            </div>`;
            divConsigneeData.append(divEl);
        }, this);
        $("#divConsignerData .grsearch-item").on("dblclick",function(){
            $("#txtConsignerName").val($(this).data("consigner_name"));
            $("#divAddressConsigner").text($(this).data("consigner_addr"));
            $("#divAddressConsigner").append('<br/>' + $(this).data("consigner_cntct"));
            closeDialog("#dialogConsigner");
        });
        $("#divConsigneeData .grsearch-item").on("dblclick",function(){
            $("#txtConsigneeName").val($(this).data("consignee_name"));
            $("#divAddressConsignee").text($(this).data("consignee_addr"));
            $("#divAddressConsignee").append('<br/>' + $(this).data("consignee_cntct"));
            closeDialog("#dialogConsignee");
        });
    //     }
    // );
}
//******* End Region G.R. Book *******

//******* Region Master Data *******
function bindMasterEvents() {
    $('#cities-panel #btnAddCity').on("click",function(){
        $("#citySubmitType").val("add"); $("#txtCityId").val(null); $("#txtCityName").val(null);
        checkDirty_textfield(); loaddialog('#dialogCity');
    });
    $('#consign-panel #btnAddConsignMain').on("click",function(){ loaddialog('#dialogConsign'); });
    $('#drivers-panel #btnAddDriverMain').on("click",function(){ loaddialog('#dialogDriver'); });
    $('#vehicle-panel #btnAddVehicleMain').on("click",function(){ loaddialog('#dialogVehicle'); });
    $('#btnAddPaymentTypeMain').on("click",function(){ loaddialog('#dialogPaymentType'); });
    $('#btnAddPriorityMain').on("click",function(){ loaddialog('#dialogPriority'); });
    $('#btnAddGRTypeMain').on("click",function(){ loaddialog('#dialogGRType'); });
    $('#btnAddTLTypeMain').on("click",function(){ loaddialog('#dialogTruckLoadType'); });
}

function loadMasterPanels(){
    //// loadCityMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#city-List").empty();
        var resDataJson = '[{ "city_id":1, "city_name":"Mumbai" },{ "city_id":2, "city_name":"Pune" },{ "city_id":3, "city_name":"Ahmedabad" },{ "city_id":4, "city_name":"Bangalore" },{ "city_id":5, "city_name":"Delhi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addCityToList(element.city_id, element.city_name);
        }, this);

    //     }
    // );
    
    //// loadConsignMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#consign-List").empty();
        var resDataJson = '[{"consign_id":1, "consign_name":"Payal Patel", "consign_addr":"Payal, Grant Road, Mumbai, 400007", "consign_cntct":"9725586862"},{ "consign_id":2, "consign_name":"Aditya Toshniwal", "consign_addr":"Aditya, Grant Road, Mumbai, 400007", "consign_cntct":"9725586862"},{ "consign_id":3, "consign_name":"Parshwa Shah", "consign_addr":"Parshwa, Grant Road, Mumbai,, 400007", "consign_cntct":"9725586862"},{ "consign_id":4, "consign_name":"Rachit Bhatnagar", "consign_addr":"Rachit, Grant Road, Mumbai,, 400007", "consign_cntct":"9725586862"},{ "consign_id":5, "consign_name":"Bhumika Sanghvi", "consign_addr":"Bhumika, Grant Road, Mumbai,, 400007", "consign_cntct":"9725586862"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addConsignToList(element.consign_name, element.consign_addr, element.consign_cntct);
        }, this);

    //     }
    // );

    //// loadDriverMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#driver-List").empty();
        var resDataJson = '[{ "driver_id":1, "driver_name":"Payal Patel" },{ "driver_id":2, "driver_name":"Aditya Toshniwal" },{ "driver_id":3, "driver_name":"Parshwa Shah" },{ "driver_id":4, "driver_name":"Rachit Bhatnagar" },{ "driver_id":5, "driver_name":"Bhumika Sanghvi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addDriverToList(element.driver_name);
        }, this);

    //     }
    // );

    //// loadVehicleMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#vehicle-List").empty();
        var resDataJson = '[{ "vehicle_id":1, "vehicle_name":"vehicleName 123", "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":1, "vehicle_name":"vehicleName 456", "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":1, "vehicle_name":"vehicleName 789", "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":1, "vehicle_name":"vehicleName XYZ", "vehicle_no":"XXX XXXX 2519" },{ "vehicle_id":1, "vehicle_name":"vehicleName ABC", "vehicle_no":"XXX XXXX 2519" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addVehicleToList(element.vehicle_name, element.vehicle_no);
        }, this);

    //     }
    // );

    //Remove - It will be static
    //// loadPaymentTypeMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divPaymentTypeData").empty();
        var resDataJson = '[{ "paymentTypeSeq":1, "paymentTypeName":"paymentTypeName 123"}, { "paymentTypeSeq":2, "paymentTypeName":"paymentTypeName 456"}, { "paymentTypeSeq":3, "paymentTypeName":"paymentTypeName 789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addPaymentTypeToList(element.paymentTypeName, element.paymentTypeSeq);
        }, this);

    //     }
    // );

    //// loadPriorityMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divPriorityData").empty();
        var resDataJson = '[{ "pri_id":1, "pri_name":"Low" },{ "pri_id":2, "pri_name":"Normal" },{ "pri_id":3, "pri_name":"High" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addPriorityToList(element.pri_name);
        }, this);

    //     }
    // );

    //// loadGRTypeMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divGRTypeData").empty();
        var resDataJson = '[{ "gr_type_id":1, "gr_type_desc":"GRType 1" },{ "gr_type_id":2, "gr_type_desc":"GRType 2" },{ "gr_type_id":3, "gr_type_desc":"GRType 3" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addGRTypeToList(element.gr_type_desc);
        }, this);

    //     }
    // );

    //// loadTLTypeMasterPanel ////
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divTruckLoadTypeData").empty();
        var resDataJson = '[{ "tl_id":1, "tl_name":"TL 1" },{ "tl_id":2, "tl_name":"TL 2" },{ "tl_id":3, "tl_name":"TL 3" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addTLTypeToList(element.tl_name);
        }, this);

    //     }
    // );
}

function addCityToList(cityid, cityname) {
    if(cityname == null){
        cityname = $("#dialogCity #txtCityName").val();
    }
    var cityList = $("#city-List");
    var divEl = `
        <div class="mdl-grid data-list-item" data-city_id="`+cityid+`">
            <div class="mdl-cell mdl-cell--11-col">
                <span id="cityName" style="font-size:16px" role="link">`+cityname+`</span>
            </div>
            <div class="mdl-cell mdl-cell--1-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onClick="(function(divItem){
                    g_cityDivItem = divItem;
                    var cityid = $(g_cityDivItem).data('city_id');
                    var cityName = $(g_cityDivItem).find('#cityName').text();
                    $('#dialogCity #citySubmitType').val('edit');
                    $('#dialogCity #txtCityId').val(cityid);
                    $('#dialogCity #txtCityName').val(cityName);
                    loaddialog('#dialogCity');
                    checkDirty_textfield();
                })($(this).closest('.data-list-item'));">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onClick="(function(divItem){
                    var cityid = $(g_cityDivItem).data('city_id');//pass city id to service to delete
                    //Call service to Delete data. //If success then update the grid.
                    divItem.remove();
                })($(this).closest('.data-list-item'));">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    cityList.append(divEl);
    cityList.scrollTop(1E10);
    if($("#dialogCity").is(":visible")){
        closeDialog("#dialogCity");
    }
}

function addConsignToList(conName, conAddr, conContact) {
    if(conName == null){
        conName = $("#dialogConsign #txtConName").val();
    }
    if(conAddr == null){
        conAddr = $("#dialogConsign #txtConAddr").val();
    }
    if(conContact == null){
        conContact = $("#dialogConsign #txtConContact").val();
    }
    var consignList = $("#consign-List");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <div><span style="font-size:18px">`+conName+`</span></div>
                <div>
                    <span style="font-size:12px">Address : `+conAddr+`</span>&nbsp;&nbsp;|&nbsp;
                    <span style="font-size:12px">Contact : `+conContact+`</span>
                </div>
            </div>
            <div class="mdl-cell mdl-cell--1-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    consignList.append(divEl);
    consignList.scrollTop(1E10);
    if($("#dialogConsign").is(":visible")){
        closeDialog("#dialogConsign");
    }
}

function addDriverToList(driverName) {
    if(driverName == null){
        driverName = $("#dialogDriver #txtDriverName").val();
    }
    var driverList = $("#driver-List");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <span>`+driverName+`</span>
            </div>
            <div class="mdl-cell mdl-cell--1-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    driverList.append(divEl);
    driverList.scrollTop(1E10);
    if($("#dialogDriver").is(":visible")){
        closeDialog("#dialogDriver");
    }
}

function addVehicleToList(vehicleName, vehicleNo) {
    if(vehicleName == null){
        vehicleName = $("#dialogVehicle #txtVehicleName").val();
    }
    if(vehicleNo == null){
        vehicleNo = $("#dialogVehicle #txtVehicleNo").val();
    }
    var vehicleList = $("#vehicle-List");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <div><span style="font-size:18px">`+vehicleName+`</span></div>
                <div><span style="font-size:12px">`+vehicleNo+`</span></div>
            </div>
            <div class="mdl-cell mdl-cell--1-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    vehicleList.append(divEl);
    vehicleList.scrollTop(1E10);
    if($("#dialogVehicle").is(":visible")){
        closeDialog("#dialogVehicle");
    }
}

function addPaymentTypeToList(paymentTypeName, paymentTypeSeq) {
    if(paymentTypeName == null){
        paymentTypeName = $("#dialogPaymentType #txtPaymentTypeName").val();
    }
    if(paymentTypeSeq == null){
        paymentTypeSeq = $("#dialogPaymentType #txtPaymentTypeSeq").val();
    }
    var paymentTypeList = $("#divPaymentTypeData");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--8-col">
                <span>`+paymentTypeName+`</span>
            </div>
            <div class="mdl-cell mdl-cell--1-col">
                <span>`+paymentTypeSeq+`</span>
            </div>                                
            <div class="mdl-cell mdl-cell--1-col">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="payid1">
                    <input type="checkbox" id="payid1" class="mdl-switch__input" checked>
                    <span class="mdl-switch__label"></span>
                </label>
            </div>
            <div class="mdl-cell mdl-cell--2-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`
    paymentTypeList.append(divEl);
    paymentTypeList.scrollTop(1E10);
    if($("#dialogPaymentType").is(":visible")){
        closeDialog("#dialogPaymentType");
    }
}

function addPriorityToList(priority) {
    if(priority == null){
        priority = $("#dialogPriority #txtPriority").val();
    }
    var PriorityList = $("#divPriorityData");
    var divEl = `
         <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span>`+priority+`</span></div>
            </div>            
            <div class="mdl-cell mdl-cell--2-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    PriorityList.append(divEl);
    PriorityList.scrollTop(1E10);
    if($("#dialogPriority").is(":visible")){
        closeDialog("#dialogPriority");
    }
}

function addGRTypeToList(grType) {
    if(grType == null){
        grType = $("#dialogGRType #txtGRType").val();
    }
    var GRTypeList = $("#divGRTypeData");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span>`+grType+`</span></div>
            </div>
            <div class="mdl-cell mdl-cell--2-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    GRTypeList.append(divEl);
    GRTypeList.scrollTop(1E10);
    if($("#dialogGRType").is(":visible")){
        closeDialog("#dialogGRType");
    }
}

function addTLTypeToList(tlType) {
    if(tlType == null){
        tlType = $("#dialogTruckLoadType #txtTLType").val();
    }
    var TLTypeList = $("#divTruckLoadTypeData");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span>`+tlType+`</span></div>
            </div>
            <div class="mdl-cell mdl-cell--2-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    TLTypeList.append(divEl);
    TLTypeList.scrollTop(1E10);
    if($("#dialogTruckLoadType").is(":visible")){
        closeDialog("#dialogTruckLoadType");
    }
}

function submitData(masterDataType){
    switch(masterDataType) {
        case "city":
            {
                var submittype = $("#citySubmitType").val();
                switch(submittype) {
                    case "add":
                        {
                            //Call service to Add/Update data. //If success then update the grid.
                            var cityid = 0;//cityid return from service
                            var cityname = $("#dialogCity #txtCityName").val();
                            addCityToList(cityid, cityname);
                        }
                        break;
                    case "edit":
                        {
                            g_cityDivItem.find("#cityName").text($("#dialogCity #txtCityName").val());
                            if($("#dialogCity").is(":visible")){
                                closeDialog("#dialogCity");
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
            break;
        case "consign":
            {
            }
            break;
        case "driver":
            {
            }
            break;
        case "vehicle":
            {
            }
            break;
        case "paymenttype":
            {
            }
            break;
        case "priority":
            {
            }
            break;
        case "grtype":
            {
            }
            break;
        case "tltype":
            {
            }
            break;
        default:
            break;
    }
}
//******* End Region Master Data *******

//******* Region Reports *******
function bindReportEvents() {
    $('#generateReport').on("click",function(){ generateReport(); });
    $('#savePDF').on("click",function(){ saveReport(); });
    $('#repFrame').on("did-start-loading",function(){ disableReportBtn(true); });
    $('#repFrame').on("did-stop-loading",function(){ disableReportBtn(false); });
    loadReportNameDD();
}

function loadReportNameDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selRepName").children().remove();
            $("#selRepName").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "rep_id":1, "rep_name":"Report 1" }, { "rep_id":2, "rep_name":"Report 2" }, { "rep_id":3, "rep_name":"Report 3" }, { "rep_id":4, "rep_name":"Report 4" }, { "rep_id":5, "rep_name":"Report 5" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selRepName").append('<option value=' + element.rep_id + '>' + element.rep_name + '</option>');
            }, this);
    //     }
    // );
}

function generateReport(){
    // setTimeout( function() {
    //     $("#repFrame").attr( 'src', 'reports/testreport.html');
    // }, 200 );
    $("#repFrame").attr( 'src', 'reports/testreport.html');
}

function saveReport(){
    dialog.showSaveDialog(
        {
            defaultPath:'~/printfile.pdf',
            filters: [
                { name: 'PDF', extensions: ['pdf'] }
            ]
        }, function (fileName) {
            if (fileName === undefined) return;
            $("#repFrame")[0].printToPDF(
                {printBackground: true}, 
                function (error, data) {
                    if (error) throw error
                    fs.writeFile(fileName, data, function (error) {
                        if (error) { throw error }
                        shell.openItem(fileName)
                    })
            });                    

        }
    );
}

function disableReportBtn(val = false){
    $('#generateReport').prop('disabled', val);
    if(val){
        $("#generateReport").html("Generating...");
    }
    else{
        $("#generateReport").html("Generate");
    }
}
//******* End Region Reports *******

//******* Region User Manager Data *******
function bindUserManagerEvents() {
    $('#btnCreateCoupon').click(function(){ loaddialog('#dialogCoupon'); });
    loadUsers();
}

function loadUsers(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#user-List").empty();
        var resDataJson = '[{ "disp_name":"Aditya Toshniwal", "user_id":"aditya123" }, { "disp_name":"Parshwa Shah", "user_id":"parshwa123" }, { "disp_name":"Payal Patel", "user_id":"payal123" }, { "disp_name":"Bhumika Sanghvi", "user_id":"bhumika123" }, { "disp_name":"Rachit Bhatnagar", "user_id":"rachit123" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addUserToList(element.disp_name, element.user_id);
        }, this);

    //     }
    // );
}

function addUserToList(username, LoginId) {
    var userList = $("#user-List");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span style="font-size:18px">`+username+`</span></div>
                <div>
                    <span style="font-size:12px">Login Id</span>&nbsp;&nbsp;:&nbsp;
                    <span style="font-size:12px">`+LoginId+`</span>
                </div>
            </div>
            <div class="mdl-cell mdl-cell--1-col">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="`+LoginId+`">
                    <input type="checkbox" id="`+LoginId+`" class="mdl-switch__input" checked>
                    <span class="mdl-switch__label"></span>
                </label>
            </div>                
            <div class="mdl-cell mdl-cell--1-col" style="text-align:right">
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                    <i class="material-icons">mode_edit</i>
                </button>
                <button class="data-list-buttons mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onclick="$(this).closest('.data-list-item').remove();">
                    <i class="material-icons">delete_forever</i>
                </button>
            </div>
        </div>`;
    userList.append(divEl);
    userList.scrollTop(1E10);
}
//******* End Region User Manager Data *******

//******* Region Common *******
function loadFlatpickr(){
    flatpickr(".flatpickr",{
            'static': true,
            allowInput:true,
            // defaultDate: new Date(),
            dateFormat: "d/m/Y"
        });
}

function loaddialog(dialogId){
    var v_dialog = $(dialogId)[0];
    v_dialog.showModal();
    // dialog.querySelector('.close').addEventListener('click', function() {
    //     dialog.close();
    // });
}

function closeDialog(elId) {
    $(elId)[0].close();
}

function scrollToBottom(){
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
}

function checkDirty_textfield(){
    // Floating Label not working when value is autofilled in textboxes. Hence below code. checkDirty updates MDL state explicitly if necessary.  "is-dirty" is the class that triggers the floating label.//
    var nodeList = $(".mdl-textfield");
    Array.prototype.forEach.call(nodeList, function (elem) {
        elem.MaterialTextfield.checkDirty();
    });
}

function checkFileExists(filepath){
    if(fs.existsSync(filepath)){ 
        return true; 
    }
    else { return false; }
}

function showSnackbar(data){
    var snackbarContainer = document.querySelector('#fleetSnackbar');
    // var snackbarContainer1 = $('#fleetSnackbar');
    // alert(snackbarContainer);
    // alert(snackbarContainer1);
    var snackbarContent = {message: data};
    snackbarContainer.MaterialSnackbar.showSnackbar(snackbarContent);
}
//******* End Region Common *******

//******* Region WEB Service API  *******
function callWebService(methodtype, urlToCall, serviceParameter, sucessCallbackFunc, 
                        failCallBackFunc = function(){}
                        )
{
	$.ajax({
		//type: "POST",
		method: methodtype,//'GET',
		//url: "https://jsonplaceholder.typicode.com/posts/1", // add web service Name and web service Method Name
		url: urlToCall,//"http://localhost:49380/Api/demo", // add web service Name and web service Method Name
		data: serviceParameter,//"{'Custname':'Payal'}",  //web Service method Parameter Name and ,user Input value which in Name Variable.
		contentType: "application/json; charset=utf-8",
		dataType: "json",
        timeout: 15000,
		success: function(response) {
            sucessCallbackFunc(response)
		},
        failure: function (msg)
        {
            failCallBackFunc();
            alert('Failure : '+msg+
                    '\nPlease contact software provider !!');
        },
        error: function(jqXHR, textStatus, errorThrown ) {
            failCallBackFunc();
            if (jqXHR.readyState == 4) {
                alert("Error : "+jqXHR.status+" : "+jqXHR.statusText +
                    "\n" + textStatus +" : "+errorThrown+
                    "\nPlease contact software provider !!");
            }
            else if (jqXHR.readyState == 0) {
                alert("Error : Connection refused or network error !!"+
                    "\nPlease contact software provider !!");      
            }
            else {
                alert("Error : "+jqXHR.status+" : "+jqXHR.responseText +
                "\n" + textStatus +" : "+errorThrown+
                "\nPlease contact software provider !!");   
            }            
          
        }
	});
}
//******* End Region WEB Service API  *******
