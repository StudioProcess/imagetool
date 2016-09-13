$(document).ready(function() {
	console.log("up & running..");
	
	$NAV = $('.nav');
	$CONSOLE = $('.output');
	$FORM = $('#testform');
	token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHA6XC9cL2l0by5wcm9jZXNzLnN0dWRpb1wvYXBpXC9wdWJsaWNcL2FwaVwvdXNlclwvbG9naW4iLCJpYXQiOjE0NzM3ODU0MjUsImV4cCI6MTQ3Mzc4OTAyNSwibmJmIjoxNDczNzg1NDI1LCJqdGkiOiIxNDA1MTgwNzBlMTE1NWQyMjU2ZTkwY2M5OGMwNDk1NCJ9.DIKcJ4RFUzLHjeLFeN87AIiQmHE7IW2PIsbkGZfO0dk";
	
	createRequest('test', 'GET', 'test',
		{
			"email":"crux23@gmail.com",
			//"password":"12345678"
		}
	);
	
	createRequest('user/register', 'POST', 'user/register',
		{
			"name":"Michael",
			"email":"crux23@gmail.com",
			"password":"12345678"
		}
	);
	createRequest('user/login - invalid', 'POST', 'user/login',
		{
			"email":"crux23@gmail.com",
			"password":"xxxxxxxx"
		}
	);
	createRequest('user/login - valid', 'POST', 'user/login',
		{
			"email":"crux23@gmail.com",
			"password":"12345678"
		}
	);
	createRequest('user/logout', 'GET', 'user/logout',
		{
			"token":token
		}
	);
	createRequest('user/get user details - invalid token', 'POST', 'user/get_user_details',
		{
			"token":"kjhkhkhiohöjkh43kjhrlh3z3ufhiruehifuhweiughfeiguiegwiu"
		}
	);
	createRequest('user/get user details', 'POST', 'user/get_user_details',
		{
			"token":token
		}
	);
	createRequest('user/get user details - no data', 'POST', 'user/get_user_details',
		{
		}
	);
	createRequest('user/get userstats', 'GET', 'user/get_userstats',
		{
			"token":token
		}
	);
	
	createRequest('user/update', 'POST', 'user/update',
		{
			"name":"Michael",
			"password":"12345678",
			"password_confirmation":"12345678",
			"brands":"brand names",
			"theme_color":"theme_color is red",
			"token":token
		}
	);
	
	$('#images').on('change', handleFileSelect);
	
	createFileUploadRequest('add_images', 'POST', 'add_images', {});
	
	createRequest('process_images', 'POST', 'process_images',
		{
			"token":token
		}
	);
});

var API_URL = "http://localhost:3000/api/public/api/";
var $NAV, $CONSOLE, $FORM;
var token;

function createRequest(label, type, route, data) {

	var $button = $('<div class="button">'+label+'</div>');
	
	$button.click(function() {
		$CONSOLE.html('loading ...');
		$.ajax({
			url: API_URL+route,
			dataType: "json",
			type: type,
			data: data,
			success: function (data) {
				$CONSOLE.html('ajax -> success<br/><br/>status: '+data.status+'<br/>message: '+data.message+'<br/><br/>data:<br/>'+JSON.stringify(data.data));
				console.log(API_URL+route);
				console.log(data);
			},
			error: function (data) {
				$CONSOLE.html('ajax -> error<br/><br/>status: '+data.status+'<br/>statusText: '+data.statusText+'<br/><br/>responseText:<br/><br/>'+data.responseText);
				console.log(API_URL+route);
				console.log(data);
			},
		});
	}); 
	$NAV.append($button);
}



var filesToUpload = [];
function handleFileSelect(event) {
    var files = event.target.files || event.originalEvent.dataTransfer.files;
    $.each(files, function(file) {
        filesToUpload.push(file);
    });
}

function createFileUploadRequest(label, type, route, data) {

	var $button = $('<div class="button">'+label+'</div>');
	
	$button.click(function() {
		$CONSOLE.html('loading ...');
		
		var formData = new FormData($FORM[0]);
		formData.append("token",token);

	    // Prevent multiple submisions
	    if ($FORM.data('loading') === true) {
	        return;
	    }
	    $FORM.data('loading', true);

	    // Add selected files to FormData which will be sent
	    if (filesToUpload) {
	        $.each(filesToUpload, function(file){
	            formData.append('cover[]', file);
	        });        
	    }
	
		$.ajax({
			url: API_URL+route,
			dataType: "json",
			type: type,
			data: formData,
            contentType: false,
            processData: false,
			success: function (data) {
				$CONSOLE.html('ajax -> success<br/><br/>status: '+data.status+'<br/>message: '+data.message+'<br/><br/>data:<br/>'+JSON.stringify(data.data));
				console.log(API_URL+route);
				console.log(data);
			},
			error: function (data) {
				$CONSOLE.html('ajax -> error<br/><br/>status: '+data.status+'<br/>statusText: '+data.statusText+'<br/><br/>responseText:<br/><br/>'+data.responseText);
				console.log(API_URL+route);
				console.log(data);
			},
			complete: function() {
	            // Allow form to be submited again
	            $FORM.data('loading', false);
	        },
		});
	}); 
	$NAV.append($button);
}