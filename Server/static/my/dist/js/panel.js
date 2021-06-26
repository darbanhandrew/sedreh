function SetModalSize(classSize) {
	document.getElementById("modal-dialog").className = "modal-dialog modal-dialog-centered " + classSize;
}


function ToggleDarkMode() {
	var elem = document.getElementsByClassName("main-sidebar")[0];

	elem.classList.toggle("sidebar-dark-primary");
	elem.classList.toggle("sidebar-light-primary");

	var elem = document.getElementsByClassName("main-header")[0];

	elem.classList.toggle("navbar-dark");
	elem.classList.toggle("navbar-light");
}

function show_order(id)
{
	csrf = $("#id").attr("csrf");
	$.ajax({
        url : "/ordering/show-order/", // the endpoint
        type : "POST", // http method
		headers: {'X-CSRFToken': csrf},
        data : {"id":id}, // data sent with the post request

        // handle a successful response
        success : function(json) {
            // $('#post-text').val(''); // remove the value from the input
            console.log(json); // log the returned json to the console
			var vectorSource = new ol.source.Vector({
			  features: new ol.format.GeoJSON().readFeatures(json),
			});

			var vectorLayer = new ol.layer.Vector({
			  source: vectorSource,
			});
			map.addLayer(vectorLayer);
            console.log("success"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console

        }
    });
	// var vectorSource = new ol.Source.Vector({
    // features: new GeoJSON().readFeature(geojsonObject),
// });
// 	var vectorLayer = new ol.Vector.VectorLayer({
//   source: vectorSource,
//   style: styleFunction,
// });
}
function create_order(btn)
{
	console.log("create order is working!")
	var formData = $(".modal-body form").serializeArray()
	btn = $(btn);
	btn.text('در حال ثبت');
	console.log(formData)
	    $.ajax({
        url : "/ordering/create-order/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request

        // handle a successful response
        success : function(json) {
            // $('#post-text').val(''); // remove the value from the input
            console.log(json); // log the returned json to the console
            console.log("success"); // another sanity check
			btn.text('ثبت انجام شد');
			alert('ثبت با موفقیت انجام شد.');
			$('#exampleModalCenter').modal('toggle');
			ClearMapfromDrawLayer()
        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        	btn.text('دوباره تلاش کنید.');

        }
    });
}

function modal_new_order(modal_body) {
	$(".modal").modal('toggle');
	$(".modal-title").html("سفارش جدید");
	$(".modal-body").html(modal_body);
	SetModalSize("modal-lg")

	//Initialize Select2 Elements
	$('.select2').select2();

	$('#region-by-city').click(function () {
	$('#region-by-city').removeClass('btn-default');
	$('#region-by-city').addClass('btn-info');
	$('#region-by-polygon').removeClass('btn-info');
	$('#region-by-polygon').addClass('btn-default');
	$('#region-by-city-row').css('display','flex')
	$('#region-by-polygon-row').css('display','none')
	});

	$('#region-by-polygon').click(function () {
	$('#region-by-city').removeClass('btn-info');
	$('#region-by-city').addClass('btn-default');
	$('#region-by-polygon').removeClass('btn-default');
	$('#region-by-polygon').addClass('btn-info');
	$('#region-by-city-row').css('display','none')
	$('#region-by-polygon-row').css('display','flex')
	});

	$('.datepicker-normal').persianDatepicker({
	format: 'dddd D MMMM YYYY',
	autoClose: true
	});

	var from, to;
	from = $('.datepicker-from').persianDatepicker({
	format: 'dddd D MMMM YYYY',
	autoClose: true,
		altField: '.date-from-alt',
	onSelect: function (unix) {
		from.touched = true;
		if (to && to.options && to.options.minDate != unix) {
		var cachedValue = to.getState().selected.unixDate;
		to.options = {minDate: unix};
		if (to.touched) {
			to.setDate(cachedValue);
		}
		}
	}
	});

	to = $('.datepicker-to').persianDatepicker({
	format: 'dddd D MMMM YYYY',
	autoClose: true,
		altField: '.date-to-alt',
	onSelect: function (unix) {
		to.touched = true;
		if (from && from.options && from.options.maxDate != unix) {
		var cachedValue = from.getState().selected.unixDate;
		from.options = {maxDate: unix};
		if (from.touched) {
			from.setDate(cachedValue);
		}
		}
	}
	});
}

// --------------------------- clock
//get elements
function getElem(id){
	return document.getElementById(id);
}
//attach 0 to under 10 digits
function digitConfig(digit){
	if(digit<10){
		return '0'+digit;
	}
	return digit;
}
function beginClock(){
	var date=new Date();
	getElem('date').innerHTML=date.toLocaleDateString('fa-IR');
	getElem('time').innerHTML=date.toLocaleTimeString('fa-IR');
}
//start clock
beginClock();
setInterval('beginClock()',500);
