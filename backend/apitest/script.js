$(document).ready(function() {
	console.log("up & running..");
	
	var API_URL = "http://localhost:3000/api/public/api/";
	var $NAV, $CONSOLE, $FORM;
	var token;

	$NAV = $('.nav');
	$CONSOLE = $('.output');
	$FORM = $('#testform');
	token = "";
	
	createRequest('user/register', 'POST', 'user/register',
		{
			"name":"Michael",
			"email":"crux23@gmail.com",
			"password":"12345678",
			"brands":["vw", "jeep", "toyota"]
		}
	,false);
	/*
createRequest('user/login - invalid', 'POST', 'user/login',
		{
			"email":"crux23@gmail.com",
			"password":"xxxxxxxx"
		}
	);
*/
	createRequest('user/login', 'POST', 'user/login',
		{
			"email":"crux23@gmail.com",
			"password":"12345678"
		}
	,false);
	createRequest('user/logout', 'GET', 'user/logout',
		{
			"token":token
		}
	,true);
	/*
createRequest('user/get user details - invalid token', 'POST', 'user/get_user_details',
		{
			"token":"kjhkhkhiohöjkh43kjhrlh3z3ufhiruehifuhweiughfeiguiegwiu"
		}
	);
*/
	createRequest('user/get user details', 'POST', 'user/get_user_details',
		{
			"token":token
		}
	,true);
	/*
createRequest('user/get user details - no data', 'POST', 'user/get_user_details',
		{
		}
	);
*/
	createRequest('user/get userstats', 'GET', 'user/get_userstats',
		{
			"token":token
		}
	,true);
	
	createRequest('user/update', 'POST', 'user/update',
		{
			"name":"Michael",
			"password":"12345678",
			"password_confirmation":"12345678",
			"brands":["vw", "jeep", "toyota"],
			"theme_color":"theme_color is red",
			"token":token
		}
	,true);
	
	$('#images').on('change', handleFileSelect);
	createFileUploadRequest('add images', 'POST', 'add_images', {});
	
	createRequest('remove image', 'POST', 'remove_image',
		{
			"image_id":2,
			"token":token
		}
	,true);
	
	createRequest('get images', 'GET', 'get_images',
		{
			"token":token
		}
	,true);
	
	createRequest('set cover', 'POST', 'set_cover',
		{
			"image_id":1,
			"border":
				{
					"color1":"#efe409",
					"color2":"#ffaf4b",
					"orientation":"horizontal"
				},
			"logos":
				{
					"position":4,
					"brand":"toyota"
				},
			"eyecatcher":
				{
					"position":2,
					"form":"circle",
					"color":"#ffffff",
					"text":"10.000,-"
				},
			"token":token
		}
	,true);
	
	createRequest('get cover settings', 'GET', 'get_cover_settings',
		{
			"token":token
		}
	,true);
	
	createRequest('get image archive', 'GET', 'get_image_archive',
		{
			"token":token
		}
	,true);
	
	function createRequest(label, type, route, data, needs_token) {
	
		var $button = $('<div class="button">'+label+'</div>');
		
		$button.click(function() {
			$CONSOLE.html('loading ...');
			if (needs_token) {
				data.token = token;
			}
			$.ajax({
				url: API_URL+route,
				dataType: "json",
				type: type,
				data: data,
				success: function (data) {
					$CONSOLE.html('ajax -> success<br/><br/>status: '+data.status+'<br/>message: '+data.message+'<br/>token: '+data.token+'<br/><br/>data:<br/>'+JSON.stringify(data.data));
					console.log(API_URL+route);
					console.log(data);
					if ( data.token ) {
						token = data.token;
					}
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
					if ( data.token ) {
						token = data.token;
					}
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
	
});
