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

$('#btnCreateCoupon').click(function(){ loaddialog('#dialogCoupon'); });
$('#aNewUser').click(function(){ loaddialog('#dialogNewUser'); });

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

function loadDashboard()
{
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