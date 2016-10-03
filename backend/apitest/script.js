$(document).ready(function() {
	console.log("up & running..");
	
	var API_URL = "http://localhost:3000/api/public/api/";
	//var API_URL = "http://ito.process.studio/api/public/api/";
	var $NAV, $CONSOLE, $FORM;
	var token;

	$NAV = $('.nav');
	$CONSOLE = $('.output');
	$FORM = $('#testform');
	token = "";
	
	createRequest('login Admin', 'POST', 'login',
		{
			"email":"crux123456@gmail.com",
			"password":"12345678"
		}
	,false);
	createRequest('login User1', 'POST', 'login',
		{
			"email":"crux123@gmail.com",
			"password":"12345678"
		}
	,false);
	createRequest('logout', 'GET', 'logout',
		{
			"token":token
		}
	,true);

	createSeperator("admin:");

	createRequest('admin/register_user User1', 'POST', 'admin/register_user',
		{
			"name":"Michael",
			"email":"crux123@gmail.com",
			"password":"12345678",
			"brands":["vw", "jeep", "toyota"],
			"token":token
		}
	,true);
	
	createRequest('admin/register_user invalid', 'POST', 'admin/register_user',
		{
			"name":"Michael",
			"email":"crux234@gmail.com",
			"password":"12345678",
			"brands":["vw", "jeep", "toyota"],
			"token":token
		}
	,true);
	
	createRequest('admin/update_user User1', 'POST', 'admin/update_user',
		{
			"id":"2",
			"name":"Michael",
			"email":"crux123@gmail.com",
			"password":"12345678",
			"password_confirmation":"12345678",
			"brands":["vw", "jeep", "toyota"],
			"theme_color":"theme_color is red",
			"token":token
		}
	,true);
	
	createRequest('admin/update_user Admin', 'POST', 'admin/update_user',
		{
			"id":"1",
			"name":"Admin",
			"email":"crux123@gmail.com",
			"password":"12345678",
			"password_confirmation":"12345678",
			"brands":["vw", "jeep", "toyota"],
			"theme_color":"theme_color is red",
			"token":token
		}
	,true);
	

	createRequest('admin/user_list', 'GET', 'admin/user_list',
		{
			"token":token
		}
	,true);
	
	
	createRequest('admin/user_stats', 'GET', 'admin/user_stats',
		{
			"id":"2",
			"token":token
		}
	,true);
	
	
	createSeperator("session:");
	
	createRequest('session/userdata', 'GET', 'session/userdata',
		{
			"token":token
		}
	,true);
	
	createRequest('session/reset', 'GET', 'session/reset',
		{
			"token":token
		}
	,true);
	
	$('#images').on('change', handleFileSelect);
	createFileUploadRequest('session/images POST', 'POST', 'session/images', {});
	
	createRequest('session/images DELETE', 'DELETE', 'session/images',
		{
			"image_id":2,
			"token":token
		}
	,true);
	
	createRequest('session/images GET', 'GET', 'session/images',
		{
			"token":token
		}
	,true);
	
	createRequest('session/cover POST', 'POST', 'session/cover',
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
	
	createRequest('session/cover GET', 'GET', 'session/cover',
		{
			"token":token
		}
	,true);
	
	createRequest('session/archive', 'GET', 'session/archive',
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
				$.ajax({
					url: API_URL+route,
					dataType: "json",
					type: type,
					data: data,
					contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
					/*
beforeSend: function(xhr){
						xhr.setRequestHeader('Authorization', 'Bearer '+token);
						xhr.setRequestHeader('Test', 'Bearer '+token);
					},
*/
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
						if ( data.token ) {
							token = data.token;
						}
					},
				});
			} else {
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
						if ( data.token ) {
							token = data.token;
						}
					},
				});
			}
			
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
					if ( data.token ) {
						token = data.token;
					}
				},
				complete: function() {
		            // Allow form to be submited again
		            $FORM.data('loading', false);
		        },
			});
		}); 
		$NAV.append($button);
	}
	
	function createSeperator(label) {
		if ( label == undefined ) {
			label = "&nbsp;";
		}
		var $seperator = $('<div class="seperator">'+label+'</div>');
		$NAV.append($seperator);	
	}
	
});
