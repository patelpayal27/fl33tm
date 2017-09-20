const ipcRenderer = require("electron").ipcRenderer;
const path = require('path')
const url = require('url')
const os = require("os");
const fs = require("fs");
//const remote = require('electron').remote
//const dialog = remote.require('dialog'); 
const {dialog,shell} = require('electron').remote;


function sleep(milliseconds) {
    for (var i = 0; i < 1000; i++) {
        null;
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

function exitApp() {
    const remote = require('electron').remote
    remote.getCurrentWindow().close()
    // $('#close-btn').on('click', e => {
    //     remote.getCurrentWindow().close()
    // })
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

function logoutUser() {
    loadLogin();
}

function loadFlatpickr(){
    flatpickr(".flatpickr",{
            'static': true,
            allowInput:true,
            // defaultDate: new Date(),
            dateFormat: "d/m/Y"
        });
}

function loadUserPageContent(el)
{
    $('#user-page-content').load($(el).data('pageurl'), function(){
        $('#user-page-header').text($(el).data('pageheader'));
        componentHandler.upgradeAllRegistered();
        loadFlatpickr();
    });

    $( ".mdl-layout" )[0].MaterialLayout.toggleDrawer();  
}

function showSearchResult() {
    srchPanel = $("#SearchResultPanel");
    srchPanel.empty();
    for (i=10000; i<10025; i++){
        divEl = `
        <div class="mdl-grid mdl-grid--no-spacing grsearch-item" data-grno="`+i+`">
            <div class="mdl-cell mdl-cell--1-col grsearch-date">
                <div class="grsearch-date-month">3 Jan</div>
                <div class="grsearch-date-year">2017</div>
            </div>
            <div class="mdl-cell mdl-cell--9-col grsearch-main">
                <div class="mdl-grid mdl-grid--no-spacing">
                    <div class="mdl-cell mdl-cell--10-col">
                        <span class="grsearch-grno">`+i+`</span>&nbsp;&nbsp;
                        <span>Mumbai -> Pune</span>
                    </div>
                </div>
                <div class="mdl-grid mdl-grid--no-spacing">
                    <div class="mdl-cell mdl-cell--10-col">
                        <span>Consigner : Aditya Toshniwal</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                        <span>Consignee : Payal Patel</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                        <span>Vehicle No. : XXXX XX 2519</span>
                    </div>
                </div>
            </div>
            <div class="mdl-cell mdl-cell--2-col grsearch-total">
                <img src="../images/rupee.svg" alt="Rs." style="width:10px;height:15px;">
                <span>123456789</span>
            </div>            
        </div>`;
        srchPanel.append(divEl);
    }
    $(".grsearch-item").on("click",function(){showGrDialog($(this).data("grno"));});
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

function addPackageToList() {
    txtMethod = $("#packageAddPanel1 #txtMethod").val();
    txtDesc = $("#packageAddPanel1 #txtDesc").val();
    txtActualWt = $("#packageAddPanel2 #txtActualWt").val();
    txtRate = $("#packageAddPanel2 #txtRate").val();
    txtChgWt = $("#packageAddPanel2 #txtChgWt").val();
    txtCft = $("#packageAddPanel2 #txtCft").val();

    packList = $("#packageList");
    
    
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--8-col">
                <div style="font-size:18px">
                    <span id="lstPackMeth">`+txtMethod+`</span>-<span id="lstPackDesc">`+txtDesc+`</span>
                </div>
                <div>
                    <span class="fleet-color-text">Actual Wt. :</span><span id="lstPackActWt">`+txtActualWt+`</span>&nbsp;|&nbsp;
                    <span class="fleet-color-text">Rate :</span><span id="lstPackRate">`+txtRate+`</span>&nbsp;|&nbsp;
                    <span class="fleet-color-text">P. Marks :</span><span id="lstPackPmarks">`+txtChgWt+`</span>&nbsp;|&nbsp;
                    <span class="fleet-color-text">CFT :</span><span id="lstPackCft">`+txtCft+`</span>
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
    //alert(divEl);
    packList.append(divEl);
    packList.scrollTop(1E10);
    // $(this).closest("data-list-item").remove();
    // $(".grsearch-item").on("click",function(){showGrDialog($(this).data("grno"));});
}

//Master Data Page Starts
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

function bindLoginEvents() {
    $('#btnSettings').click(function(){ loadSettingsDialog(); });
    $('#btnSaveSettings').click(function(){ saveSettings(); });
    $('#aNewUser').click(function(){ loaddialog('#dialogNewUser'); });
}

function bindUserManagerEvents() {
    $('#btnCreateCoupon').click(function(){ loaddialog('#dialogCoupon'); });
}

function loaddialog(dialogId){
    var v_dialog = $(dialogId)[0];
    v_dialog.showModal();
    // dialog.querySelector('.close').addEventListener('click', function() {
    //     dialog.close();
    // });
}

function addCityToList() {
    txtCity = $("#dialogCity #txtCityName").val();
    cityList = $("#city-List");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <span style="font-size:16px" role="link">`+txtCity+`</span>
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
    //$("#dialogCity")[0].close();
    closeDialog("#dialogCity");
}

function addConsignToList() {
    txtConName = $("#dialogConsign #txtConName").val();
    txtConAddr = $("#dialogConsign #txtConAddr").val();
    txtConPin = $("#dialogConsign #txtConPin").val();
    consignList = $("#consign-List");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <div><span style="font-size:18px">`+txtConName+`</span></div>
                <div><span style="font-size:12px">`+txtConAddr+` - `+txtConPin+`</span></div>
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
    //$("#dialogConsign")[0].close();
    closeDialog("#dialogConsign");
}

function addDriverToList() {
    txtDriverName = $("#dialogDriver #txtDriverName").val();
    driverList = $("#driver-List");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <span>`+txtDriverName+`</span>
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
    //$("#dialogDriver")[0].close();
    closeDialog("#dialogDriver");
}

function addVehicleToList() {
    txtVehicleName = $("#dialogVehicle #txtVehicleName").val();
    txtVehicleNo = $("#dialogVehicle #txtVehicleNo").val();
    vehicleList = $("#vehicle-List");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--11-col">
                <div><span style="font-size:18px">`+txtVehicleName+`</span></div>
                <div><span style="font-size:12px">`+txtVehicleNo+`</span></div>
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
    //$("#dialogVehicle")[0].close();
    closeDialog("#dialogVehicle");
}

function addPaymentTypeToList() {
    txtPaymentTypeName = $("#dialogPaymentType #txtPaymentTypeName").val();
    txtPaymentTypeSeq = $("#dialogPaymentType #txtPaymentTypeSeq").val();
    paymentTypeList = $("#divPaymentTypeData");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--8-col">
                <span>`+txtPaymentTypeName+`</span>
            </div>
            <div class="mdl-cell mdl-cell--1-col">
                <span>`+txtPaymentTypeSeq+`</span>
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
    //$("#dialogPaymentType")[0].close();
    closeDialog("#dialogPaymentType");
}

function addPriorityToList() {
    txtPriority = $("#dialogPriority #txtPriority").val();
    PriorityList = $("#divPriorityData");
    divEl = `
         <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span>`+txtPriority+`</span></div>
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
    //$("#dialogPriority")[0].close();
    closeDialog("#dialogPriority");
}

function addGRTypeToList() {
    txtGRType = $("#dialogGRType #txtGRType").val();
    GRTypeList = $("#divGRTypeData");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span>`+txtGRType+`</span></div>
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
    //$("#dialogGRType")[0].close();
    closeDialog("#dialogGRType");
}

function addTLTypeToList() {
    txtTLType = $("#dialogTruckLoadType #txtTLType").val();
    TLTypeList = $("#divTruckLoadTypeData");
    divEl = `
        <div class="mdl-grid data-list-item">
            <div class="mdl-cell mdl-cell--10-col">
                <div><span>`+txtTLType+`</span></div>
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
    //$("#dialogTruckLoadType")[0].close();
    closeDialog("#dialogTruckLoadType");
}
//Master Data Page Ends

function closeDialog(elId) {
    $(elId)[0].close();
}

function scrollToBottom(){
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
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

function loadLogin() {

    $('#container').load('./login.html', function(){
        componentHandler.upgradeAllRegistered();
    });
}

function loadSettingsDialog() { 
    getSettings();
    loaddialog('#dialogSettings');
}
function getSettings() {
    var fs = require('fs');
    fs.readFile('./settings', 'utf-8', function (err,data) {
        if (err) {
            return alert(err);
        }
        $("#txtServerName").val(data);

        // Floating Label not working when value is autofilled in textboxes. Hence below code. checkDirty updates MDL state explicitly if necessary.  "is-dirty" is the class that triggers the floating label.//
        var nodeList = $(".mdl-textfield");
        Array.prototype.forEach.call(nodeList, function (elem) {
            elem.MaterialTextfield.checkDirty();
        });
    });
}
function saveSettings(){
    var fs = require('fs');
    var content = $("#txtServerName").val();
    try { 
        fs.writeFileSync('settings', content, 'utf-8');
        alert("Settings saved successfully");
        closeDialog("#dialogSettings");
    }
    catch(e) { alert('Failed to save settings !'); }
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
        divConsignerData = $("#divConsignerData");
        divConsignerData.empty();

        var resDataJson = '[{ "Id":1, "Name":"Payal Patel", "Address":"Address Payal", "Pincode":"400007 Pincode Payal" },{ "Id":2, "Name":"Aditya Toshniwal", "Address":"Address Aditya", "Pincode":"400007 Pincode Aditya" },{ "Id":3, "Name":"Parshwa Shah", "Address":"Address Parshwa", "Pincode":"400007 Pincode Parshwa" },{ "Id":4, "Name":"Rachit Bhatnagar", "Address":"Address Rachit", "Pincode":"400007 Pincode Rachit" },{ "Id":5, "Name":"Bhumika Sanghvi", "Address":"Address Bhumika", "Pincode":"400007 Pincode Bhumika" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            //alert(element.Id + ", " + element.Name + ", " + element.Address + ", " + element.Pincode);
            divEl = `
            <div class="mdl-grid data-list-item grsearch-item" data-consignerid="`+element.Id+`" data-name="`+element.Name+`" data-address="`+element.Address+`" data-pincode="`+element.Pincode+`">
                <div class="mdl-cell mdl-cell--2-col">
                    <span>`+element.Id+`</span>
                </div>
                <div class="mdl-cell mdl-cell--10-col">
                    <span>`+element.Name+`</span>
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
        divConsigneeData = $("#divConsigneeData");
        divConsigneeData.empty();

        var resDataJson = '[{ "Id":1, "Name":"Payal Patel", "Address":"Address Payal", "Pincode":"400007 Pincode Payal" },{ "Id":2, "Name":"Aditya Toshniwal", "Address":"Address Aditya", "Pincode":"400007 Pincode Aditya" },{ "Id":3, "Name":"Parshwa Shah", "Address":"Address Parshwa", "Pincode":"400007 Pincode Parshwa" },{ "Id":4, "Name":"Rachit Bhatnagar", "Address":"Address Rachit", "Pincode":"400007 Pincode Rachit" },{ "Id":5, "Name":"Bhumika Sanghvi", "Address":"Address Bhumika", "Pincode":"400007 Pincode Bhumika" }]';
        var resData = JSON.parse(resDataJson);
        resData.forEach(function(element) {
            //alert(element.Id + ", " + element.Name + ", " + element.Address + ", " + element.Pincode);
            divEl = `
            <div class="mdl-grid data-list-item grsearch-item" data-consigneeid="`+element.Id+`" data-name="`+element.Name+`" data-address="`+element.Address+`" data-pincode="`+element.Pincode+`">
                <div class="mdl-cell mdl-cell--2-col">
                    <span>`+element.Id+`</span>
                </div>
                <div class="mdl-cell mdl-cell--10-col">
                    <span>`+element.Name+`</span>
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
function loadDropDowns(){
    loadCity();
    loadDestination();
    loadDriverName();
    loadVehicleNo();
    loadGRType();
    loadFTL();
    loadPriority();
}
function loadCity(){
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
function loadDestination(){
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
function loadDriverName(){
    // callWebService(
    //     'GET',
    //     'http://localhost:5000/user/authenticate',
    //     //reqJson,
    //     function (resJson){
            $("#selDriverName").children().remove();
            $("#selDriverName").append('<option selected disabled hidden value=""></option>');
            var resDataJson = '[{ "cityId":1, "cityName":"Payal Patel" },{ "cityId":2, "cityName":"Aditya Toshniwal" },{ "cityId":3, "cityName":"Parshwa Shah" },{ "cityId":4, "cityName":"Rachit Bhatnagar" },{ "cityId":5, "cityName":"Bhumika Sanghvi" }]';
            var resData = JSON.parse(resDataJson);
            resData.forEach(function(element) {
                $("#selDriverName").append('<option value=' + element.cityId + '>' + element.cityName + '</option>');
            }, this);
    //     }
    // );
}
function loadVehicleNo(){
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
function loadGRType(){
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
function loadFTL(){
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
function loadPriority(){
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
            
            var resDataJson = '[{ "GRNO":1, "BranchCode":"Mumbai", "STPaidBy":"Consignee", "GRDate":"01/01/2017", "FromCity":"1", "Destination":"2", "DriverName":"3", "VehicleNo":"4", "ConsignerName":"Payal Patel", "ConsignerAddr":"Address Line 1, Address Line 2, Address Line 3", "ConsignerPinCode":"400007", "ConsigneeName":"Aditya Patel", "ConsigneeAddr":"Address Line 1, Address Line 2, Address Line 3", "ConsigneePinCode":"400007", "Method":"Method X", "Description":"Description XYZ", "GRType":"3", "Freight":"Freight XYZ", "CoverCharge":"5000", "DoorDelivery":"4000", "StatisticalCharge":"1000", "RiskCharge":"500", "ServiceTax":"800", "GreenTax":"500", "Total":"50000", "TotalPackages":"100", "ActWt":"5000", "ChgWt":"5000", "Rate":"4000", "FTL":"2", "PartyInvoice":"PartyInvoice XYZ", "PartyInvoiceDate":"01012016", "Remarks":"Remarks XYZ", "Priority":"5" }]';
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
                $("#txtMethod").val(element.Method);
                $("#txtDesc").val(element.Description);
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

                // Floating Label not working when value is autofilled in textboxes. Hence below code. checkDirty updates MDL state explicitly if necessary.  "is-dirty" is the class that triggers the floating label.//
                var nodeList = $(".mdl-textfield");
                Array.prototype.forEach.call(nodeList, function (elem) {
                    elem.MaterialTextfield.checkDirty();
                });
            }, this);
    //     }
    // );
}

/*********** WEB service API  ****************/
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
