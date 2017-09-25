const ipcRenderer = require("electron").ipcRenderer;
const path = require('path')
const url = require('url')
const os = require("os");
const fs = require("fs");
const remote = require('electron').remote
//const dialog = remote.require('dialog'); 
const {dialog,shell} = require('electron').remote;

function sleep(milliseconds) {
    for (var i = 0; i < 1000; i++) {
        null;
    }
}

//******* Region Login, Dashboard ********
function bindLoginEvents() {
    $('#btnSettings').click(function(){ loadSettingsDialog(); });
    $('#btnSaveSettings').click(function(){ saveSettings(); });
    $('#aNewUser').click(function(){ loaddialog('#dialogNewUser'); });
}

function loadLogin() {
    $('#container').load('./login.html', function(){
        componentHandler.upgradeAllRegistered();
    });
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

function checkSettingsFile(){
    if(!checkFileExists('./settings.json')){
        loaddialog('#dialogSettings');
    }
}

function loadSettingsDialog() {
    getSettings();
    loaddialog('#dialogSettings');
}

function getSettings() {
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

function saveSettings(){
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
}

function exitApp() {
    remote.getCurrentWindow().close()
}
//******* End Region Login, Dashboard ********

//******* G.R. Book *******
function showSearchResult() {
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        var srchPanel = $("#SearchResultPanel");
        srchPanel.empty();
        var resDataJson = '[{ "grno":"100", "day":"3", "month":"Jan", "year":"2017", "fromCity":"Mumbai", "toCity":"Pune", "consignerName":"Aditya Toshniwal", "consigneeName":"Payal Patel", "vehicleNo":"XXXX XX 2519", "totalAmt":"123456789"},{ "grno":"101", "day":"3", "month":"Jan", "year":"2017", "fromCity":"Mumbai", "toCity":"Pune", "consignerName":"Aditya Toshniwal", "consigneeName":"Payal Patel", "vehicleNo":"XXXX XX 2519", "totalAmt":"123456789"},{ "grno":"102", "day":"3", "month":"Jan", "year":"2017", "fromCity":"Mumbai", "toCity":"Pune", "consignerName":"Aditya Toshniwal", "consigneeName":"Payal Patel", "vehicleNo":"XXXX XX 2519", "totalAmt":"123456789"},{ "grno":"103", "day":"3", "month":"Jan", "year":"2017", "fromCity":"Mumbai", "toCity":"Pune", "consignerName":"Aditya Toshniwal", "consigneeName":"Payal Patel", "vehicleNo":"XXXX XX 2519", "totalAmt":"123456789"},{ "grno":"104", "day":"3", "month":"Jan", "year":"2017", "fromCity":"Mumbai", "toCity":"Pune", "consignerName":"Aditya Toshniwal", "consigneeName":"Payal Patel", "vehicleNo":"XXXX XX 2519", "totalAmt":"123456789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            var divEl = `
            <div class="mdl-grid mdl-grid--no-spacing grsearch-item" data-grno="`+element.grno+`">
                <div class="mdl-cell mdl-cell--1-col grsearch-date">
                    <div class="grsearch-date-month">`+element.day+` `+element.month+`</div>
                    <div class="grsearch-date-year">`+element.year+`</div>
                </div>
                <div class="mdl-cell mdl-cell--9-col grsearch-main">
                    <div class="mdl-grid mdl-grid--no-spacing">
                        <div class="mdl-cell mdl-cell--10-col">
                            <span class="grsearch-grno">`+element.grno+`</span>&nbsp;&nbsp;
                            <span>`+element.fromCity+` -> `+element.toCity+`</span>
                        </div>
                    </div>
                    <div class="mdl-grid mdl-grid--no-spacing">
                        <div class="mdl-cell mdl-cell--10-col">
                            <span>Consigner : `+element.consignerName+`</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                            <span>Consignee : `+element.consigneeName+`</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                            <span>Vehicle No. : `+element.vehicleNo+`</span>
                        </div>
                    </div>
                </div>
                <div class="mdl-cell mdl-cell--2-col grsearch-total">
                    <img src="../images/rupee.svg" alt="Rs." style="width:10px;height:15px;">
                    <span> `+element.totalAmt+`</span>
                </div>
            </div>`;
            srchPanel.append(divEl);
        }, this);

        $(".grsearch-item").on("click",function(){showGrDialog($(this).data("grno"));});

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
    loadCityDD();
    loadDestinationDD();
    loadDriverNameDD();
    loadVehicleNoDD();
    loadGRTypeDD();
    loadFTLDD();
    loadPriorityDD();
}

function loadCityDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selFromCity").children().remove();
            $("#selFromCity").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"Mumbai" },{ "cityId":2, "cityName":"Pune" },{ "cityId":3, "cityName":"Ahmedabad" },{ "cityId":4, "cityName":"Bangalore" },{ "cityId":5, "cityName":"Delhi" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selFromCity").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}

function loadDestinationDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selDestination").children().remove();
            $("#selDestination").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"Mumbai" },{ "cityId":2, "cityName":"Pune" },{ "cityId":3, "cityName":"Ahmedabad" },{ "cityId":4, "cityName":"Bangalore" },{ "cityId":5, "cityName":"Delhi" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selDestination").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}

function loadDriverNameDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selDriverName").children().remove();
            $("#selDriverName").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "driverId":1, "driverName":"Payal Patel" },{ "driverId":2, "driverName":"Aditya Toshniwal" },{ "driverId":3, "driverName":"Parshwa Shah" },{ "driverId":4, "driverName":"Rachit Bhatnagar" },{ "driverId":5, "driverName":"Bhumika Sanghvi" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selDriverName").append('<option value=' + element.driverId + '>' + element.driverName + '</option>');
            }, this);
    //     }
    // );
}

function loadVehicleNoDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selVehicleNo").children().remove();
            $("#selVehicleNo").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"XXX XXXX 2519" },{ "cityId":2, "cityName":"XXX XXXX 2519" },{ "cityId":3, "cityName":"XXX XXXX 2519" },{ "cityId":4, "cityName":"XXX XXXX 2519" },{ "cityId":5, "cityName":"XXX XXXX 2519" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selVehicleNo").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}

function loadGRTypeDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selGRType").children().remove();
            $("#selGRType").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"GRType 1" },{ "cityId":2, "cityName":"GRType 2" },{ "cityId":3, "cityName":"GRType 3" },{ "cityId":4, "cityName":"GRType 4" },{ "cityId":5, "cityName":"GRType 5" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selGRType").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}

function loadFTLDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selFTL").children().remove();
            $("#selFTL").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"FTL 1" },{ "cityId":2, "cityName":"FTL 2" },{ "cityId":3, "cityName":"FTL 3" },{ "cityId":4, "cityName":"FTL 4" },{ "cityId":5, "cityName":"FTL 5" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selFTL").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}

function loadPriorityDD(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selPriority").children().remove();
            $("#selPriority").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"Lowest" },{ "cityId":2, "cityName":"Low" },{ "cityId":3, "cityName":"Normal" },{ "cityId":4, "cityName":"High" },{ "cityId":5, "cityName":"Highest" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selPriority").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}

function loadGRData(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            
            var resDataJson = '[{"GRNO":1,"BranchCode":"Mumbai","STPaidBy":"Consignee","GRDate":"01/01/2017","FromCity":"1","Destination":"2","DriverName":"3","VehicleNo":"4","ConsignerName":"Payal Patel","ConsignerAddr":"Address Line 1, Address Line 2, Address Line 3","ConsignerPinCode":"400007","ConsigneeName":"Aditya Patel","ConsigneeAddr":"Address Line 1, Address Line 2, Address Line 3","ConsigneePinCode":"400007","GRType":"3","Freight":"Freight XYZ","CoverCharge":"5000","DoorDelivery":"4000","StatisticalCharge":"1000","RiskCharge":"500","ServiceTax":"800","GreenTax":"500","Total":"50000","TotalPackages":"100","ActWt":"5000","ChgWt":"5000","Rate":"4000","FTL":"2","PartyInvoice":"PartyInvoice XYZ","PartyInvoiceDate":"01012016","Remarks":"Remarks XYZ","Priority":"5","lstPMD":[{"Method":"Method XYZ","Description":"Description XYZ","ActWt":"3000","Rate":"5000","ChgWt":"4545","CFT":"CFT XYZ"},{"Method":"Method PQR","Description":"Description PQR","ActWt":"3000","Rate":"5000","ChgWt":"4545","CFT":"CFT PQR"},{"Method":"Method ABC","Description":"Description ABC","ActWt":"3000","Rate":"5000","ChgWt":"4545","CFT":"CFT ABC"},{"Method":"Method 123","Description":"Description 123","ActWt":"3000","Rate":"5000","ChgWt":"4545","CFT":"CFT 123"},{"Method":"Method 456","Description":"Description 456","ActWt":"3000","Rate":"5000","ChgWt":"4545","CFT":"CFT 456"},{"Method":"Method 789","Description":"Description 789","ActWt":"3000","Rate":"5000","ChgWt":"4545","CFT":"CFT 789"}]}]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#txtGrNo").val(element.GRNO);
                $("#txtBranchCode").val(element.BranchCode);
                $('input:radio[name="options"][value="' + element.STPaidBy + '"]').parent().addClass('is-checked');
                $("#txtGrDate").val(element.GRDate);
                $("#selFromCity").val('' + element.FromCity + '');
                $("#selDestination").val('' + element.Destination + '');
                $("#selDriverName").val('' + element.DriverName + '');
                $("#selVehicleNo").val('' + element.VehicleNo + '');
                $("#txtConsignerName").val(element.ConsignerName);
                $("#divAddressConsigner").text(element.ConsignerAddr);
                $("#divAddressConsigner").append('<br/>' + element.ConsignerPinCode);
                $("#txtConsigneeName").val(element.ConsigneeName);
                $("#divAddressConsignee").text(element.ConsigneeAddr);
                $("#divAddressConsignee").append('<br/>' + element.ConsigneePinCode);
                $("#selGRType").val('' + element.GRType + '');
                $("#txtFreight").val(element.Freight);
                $("#txtSomething").val(element.Freight);
                $("#txtCoverCharge").val(element.CoverCharge);
                $("#txtDoorDeliveryCharge").val(element.DoorDelivery);
                $("#txtStatisticalCharge").val(element.StatisticalCharge);
                $("#txtRiskCharge").val(element.RiskCharge);
                $("#txtServiceTax").val(element.ServiceTax);
                $("#txtGreenTax").val(element.GreenTax);
                $("#txtTotal").val(element.Total);
                $("#txtTotPkgs").val(element.TotalPackages);
                $("#txtActualWt").val(element.ActWt);
                $("#txtChgWt").val(element.ChgWt);
                $("#txtRate").val(element.Rate);
                $("#selFTL").val(element.FTL);
                $("#txtPartyInv").val(element.PartyInvoice);
                $("#txtPartyInvDate").val(element.PartyInvoiceDate);
                $("#txtRemarks").val(element.Remarks);
                $("#selPriority").val(element.Priority);

                element.lstPMD.forEach(function(PMDData) {
                    //alert(PMDData.Method + ", " + PMDData.Description + ", " +  PMDData.ActWt + ", " +  PMDData.Rate + ", " +  PMDData.ChgWt +  ", " + PMDData.CFT);
                    addPackageDtlsToList(PMDData.Method, PMDData.Description, PMDData.ActWt, PMDData.Rate, PMDData.ChgWt, PMDData.CFT);
                }, this);

                checkDirty_textfield();
            }, this);
    //     }
    // );
}

function addPackageToList() {
    var txtMethod = $("#packageAddPanel1 #txtMethod").val();
    var txtDesc = $("#packageAddPanel1 #txtDesc").val();
    var txtActualWt = $("#packageAddPanel2 #txtActualWt").val();
    var txtRate = $("#packageAddPanel2 #txtRate").val();
    var txtChgWt = $("#packageAddPanel2 #txtChgWt").val();
    var txtCft = $("#packageAddPanel2 #txtCft").val();
    addPackageDtlsToList(txtMethod, txtDesc, txtActualWt, txtRate, txtChgWt, txtCft);
}

function addPackageDtlsToList(method, desc, actualwt, rate, chgwt, cft) {
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

function loadConsignerDialog() { 
    getConsignerData();
    loaddialog('#dialogConsigner');
}

function getConsignerData() {
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        var divConsignerData = $("#divConsignerData");
        divConsignerData.empty();

        var resDataJson = '[{ "Id":1, "Name":"Payal Patel", "Address":"Address Payal", "Pincode":"400007 Pincode Payal" },{ "Id":2, "Name":"Aditya Toshniwal", "Address":"Address Aditya", "Pincode":"400007 Pincode Aditya" },{ "Id":3, "Name":"Parshwa Shah", "Address":"Address Parshwa", "Pincode":"400007 Pincode Parshwa" },{ "Id":4, "Name":"Rachit Bhatnagar", "Address":"Address Rachit", "Pincode":"400007 Pincode Rachit" },{ "Id":5, "Name":"Bhumika Sanghvi", "Address":"Address Bhumika", "Pincode":"400007 Pincode Bhumika" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            //alert(element.Id + ", " + element.Name + ", " + element.Address + ", " + element.Pincode);
            var divEl = `
            <div class="mdl-grid data-list-item grsearch-item" data-consignerid="`+element.Id+`" data-name="`+element.Name+`" data-address="`+element.Address+`" data-pincode="`+element.Pincode+`">
                <div class="mdl-cell mdl-cell--11-col">
                    <div><span style="font-size:18px">`+element.Name+`</span></div>
                    <div><span style="font-size:12px">`+element.Address+` - `+element.Pincode+`</span></div>
                </div>
            </div>`;
            divConsignerData.append(divEl);
        }, this);
        $(".grsearch-item").on("dblclick",function(){
            //alert("$(this).data('id') = " + $(this).data("consignerid"));
            $("#txtConsignerName").val($(this).data("name"));
            $("#divAddressConsigner").text($(this).data("address"));
            $("#divAddressConsigner").append('<br/>' + $(this).data("pincode"));
            closeDialog("#dialogConsigner");
        });
    //     }
    // );
}

function loadConsigneeDialog(){ 
    getConsigneeData();
    loaddialog('#dialogConsignee');
}

function getConsigneeData() {
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
        var divConsigneeData = $("#divConsigneeData");
        divConsigneeData.empty();

        var resDataJson = '[{ "Id":1, "Name":"Payal Patel", "Address":"Address Payal", "Pincode":"400007 Pincode Payal" },{ "Id":2, "Name":"Aditya Toshniwal", "Address":"Address Aditya", "Pincode":"400007 Pincode Aditya" },{ "Id":3, "Name":"Parshwa Shah", "Address":"Address Parshwa", "Pincode":"400007 Pincode Parshwa" },{ "Id":4, "Name":"Rachit Bhatnagar", "Address":"Address Rachit", "Pincode":"400007 Pincode Rachit" },{ "Id":5, "Name":"Bhumika Sanghvi", "Address":"Address Bhumika", "Pincode":"400007 Pincode Bhumika" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            //alert(element.Id + ", " + element.Name + ", " + element.Address + ", " + element.Pincode);
            var divEl = `
            <div class="mdl-grid data-list-item grsearch-item" data-consignerid="`+element.Id+`" data-name="`+element.Name+`" data-address="`+element.Address+`" data-pincode="`+element.Pincode+`">
                <div class="mdl-cell mdl-cell--11-col">
                    <div><span style="font-size:18px">`+element.Name+`</span></div>
                    <div><span style="font-size:12px">`+element.Address+` - `+element.Pincode+`</span></div>
                </div>
            </div>`;
            divConsigneeData.append(divEl);
        }, this);
        $(".grsearch-item").on("dblclick",function(){
            //alert("$(this).data('id') = " + $(this).data("consigneeid"));
            $("#txtConsigneeName").val($(this).data("name"));
            $("#divAddressConsignee").text($(this).data("address"));
            $("#divAddressConsignee").append('<br/>' + $(this).data("pincode"));
            closeDialog("#dialogConsignee");
        });
    //     }
    // );
}
//******* End Region G.R. Book *******

//******* Region Master Data *******
function bindMasterEvents() {
    $('#cities-panel #btnAddCityMain').on("click",function(){ loaddialog('#dialogCity'); });
    $('#consign-panel #btnAddConsignMain').on("click",function(){ loaddialog('#dialogConsign'); });
    $('#drivers-panel #btnAddDriverMain').on("click",function(){ loaddialog('#dialogDriver'); });
    $('#vehicle-panel #btnAddVehicleMain').on("click",function(){ loaddialog('#dialogVehicle'); });
    $('#btnAddPaymentTypeMain').on("click",function(){ loaddialog('#dialogPaymentType'); });
    $('#btnAddPriorityMain').on("click",function(){ loaddialog('#dialogPriority'); });
    $('#btnAddGRTypeMain').on("click",function(){ loaddialog('#dialogGRType'); });
    $('#btnAddTLTypeMain').on("click",function(){ loaddialog('#dialogTruckLoadType'); });
}

function loadMasterPanels(){
    loadCityMasterPanel();
    loadConsignMasterPanel();
    loadDriverMasterPanel();
    loadVehicleMasterPanel();
    loadPaymentTypeMasterPanel();
    loadPriorityMasterPanel();
    loadGRTypeMasterPanel();
    loadTLTypeMasterPanel();
}

function loadCityMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#city-List").empty();
        var resDataJson = '[{ "cityId":1, "cityName":"Mumbai" },{ "cityId":2, "cityName":"Pune" },{ "cityId":3, "cityName":"Ahmedabad" },{ "cityId":4, "cityName":"Bangalore" },{ "cityId":5, "cityName":"Delhi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addCityToList(element.cityName);
        }, this);

    //     }
    // );
}

function loadConsignMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#consign-List").empty();
        var resDataJson = '[{ "Id":1, "Name":"Payal Patel", "Address":"Address Payal", "Pincode":"400007 Pincode Payal" },{ "Id":2, "Name":"Aditya Toshniwal", "Address":"Address Aditya", "Pincode":"400007 Pincode Aditya" },{ "Id":3, "Name":"Parshwa Shah", "Address":"Address Parshwa", "Pincode":"400007 Pincode Parshwa" },{ "Id":4, "Name":"Rachit Bhatnagar", "Address":"Address Rachit", "Pincode":"400007 Pincode Rachit" },{ "Id":5, "Name":"Bhumika Sanghvi", "Address":"Address Bhumika", "Pincode":"400007 Pincode Bhumika" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addConsignToList(element.Name, element.Address, element.Pincode);
        }, this);

    //     }
    // );
}

function loadDriverMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#driver-List").empty();
        var resDataJson = '[{ "driverId":1, "driverName":"Payal Patel" },{ "driverId":2, "driverName":"Aditya Toshniwal" },{ "driverId":3, "driverName":"Parshwa Shah" },{ "driverId":4, "driverName":"Rachit Bhatnagar" },{ "driverId":5, "driverName":"Bhumika Sanghvi" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addDriverToList(element.driverName);
        }, this);

    //     }
    // );
}

function loadVehicleMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#vehicle-List").empty();
        var resDataJson = '[{ "vehicleId":1, "vehicleName":"vehicleName 123", "vehicleNo":"XXX XXXX 2519" },{ "vehicleId":1, "vehicleName":"vehicleName 456", "vehicleNo":"XXX XXXX 2519" },{ "vehicleId":1, "vehicleName":"vehicleName 789", "vehicleNo":"XXX XXXX 2519" },{ "vehicleId":1, "vehicleName":"vehicleName XYZ", "vehicleNo":"XXX XXXX 2519" },{ "vehicleId":1, "vehicleName":"vehicleName ABC", "vehicleNo":"XXX XXXX 2519" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addVehicleToList(element.vehicleName, element.vehicleNo);
        }, this);

    //     }
    // );
}

function loadPaymentTypeMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divPaymentTypeData").empty();
        var resDataJson = '[{ "paymentTypeSeq":1, "paymentTypeName":"paymentTypeName 123"}, { "paymentTypeSeq":1, "paymentTypeName":"paymentTypeName 456"}, { "paymentTypeSeq":1, "paymentTypeName":"paymentTypeName 789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addPaymentTypeToList(element.paymentTypeName, element.paymentTypeSeq);
        }, this);

    //     }
    // );
}

function loadPriorityMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divPriorityData").empty();
        var resDataJson = '[{ "priorityId":1, "priorityName":"Priority Desc 123"}, { "priorityId":1, "priorityName":"Priority Desc 456"}, { "priorityId":1, "priorityName":"Priority Desc 789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addPriorityToList(element.priorityName);
        }, this);

    //     }
    // );
}

function loadGRTypeMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divGRTypeData").empty();
        var resDataJson = '[{ "grTypeID":1, "grType":"GR Type 123"}, { "grTypeID":1, "grType":"GR Type 456"}, { "grTypeID":1, "grType":"GR Type 789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addGRTypeToList(element.grType);
        }, this);

    //     }
    // );
}

function loadTLTypeMasterPanel(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){

        $("#divTruckLoadTypeData").empty();
        var resDataJson = '[{ "tlTypeId":1, "tlType":"Truck Load Type 123"}, { "tlTypeId":1, "tlType":"Truck Load Type 456"}, { "tlTypeId":1, "tlType":"Truck Load Type 789"}]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addTLTypeToList(element.tlType);
        }, this);

    //     }
    // );
}

function addCityToList(cityname) {
    if(cityname == null){
        cityname = $("#dialogCity #txtCityName").val();
    }
    var cityList = $("#city-List");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <span style="font-size:16px" role="link">`+cityname+`</span>
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
    cityList.append(divEl);
    cityList.scrollTop(1E10);
    if($("#dialogCity").is(":visible")){
        closeDialog("#dialogCity");
    }
}

function addConsignToList(conName, conAddr, conPin) {
    if(conName == null){
        conName = $("#dialogConsign #txtConName").val();
    }
    if(conAddr == null){
        conAddr = $("#dialogConsign #txtConAddr").val();
    }
    if(conPin == null){
        conPin = $("#dialogConsign #txtConPin").val();
    }
    var consignList = $("#consign-List");
    var divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <div><span style="font-size:18px">`+conName+`</span></div>
                <div><span style="font-size:12px">`+conAddr+` - `+conPin+`</span></div>
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
            var resDataJson = '[{ "repId":1, "repName":"Report 1" }, { "repId":2, "repName":"Report 2" }, { "repId":3, "repName":"Report 3" }, { "repId":4, "repName":"Report 4" }, { "repId":5, "repName":"Report 5" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selRepName").append('<option value=' + element.repId + '>' + element.repName + '</option>');
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
        var resDataJson = '[{ "username":"Aditya Toshniwal", "loginId":"aditya123" }, { "username":"Parshwa Shah", "loginId":"parshwa123" }, { "username":"Payal Patel", "loginId":"payal123" }, { "username":"Bhumika Sanghvi", "loginId":"bhumika123" }, { "username":"Rachit Bhatnagar", "loginId":"rachit123" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            addUserToList(element.username, element.loginId);
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
