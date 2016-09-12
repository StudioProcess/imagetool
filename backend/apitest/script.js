$(document).ready(function() {
	console.log("up & running..");
	
	$NAV = $('.nav');
	$CONSOLE = $('.output');
	token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHA6XC9cL2l0by5wcm9jZXNzLnN0dWRpb1wvYXBpXC9wdWJsaWNcL2FwaVwvdXNlclwvbG9naW4iLCJpYXQiOjE0NzM2OTY3NTIsImV4cCI6MTQ3MzcwMDM1MiwibmJmIjoxNDczNjk2NzUyLCJqdGkiOiIxYmU3YWFmZDBhY2MxZDE0Y2U0YjhjNTQzY2RmNjFmMCJ9.w_PCF6iPIm3WAK4D2Z9hkpYc_SjkKzNPdvEj-TFe_2Y";
	
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
	
	createRequest('user/update', 'POST', 'user/update',
		{
			"name":"Michael",
			"password":"12345678",
			"password_confirmation":"12345678",
			"logo":"logourl.png",
			"brands":"brand names",
			"theme_color":"theme_color is red",
			"token":token
		}
	);
	
	//var formData = new FormData($(this).parents('form')[0]);
	var formData = new FormData();
	formData.append("token",token);
	formData.append("images[]", {name: "IMG_0018.JPG", lastModified: 1435568649000, lastModifiedDate: "Mon Jun 29 2015 11:04:09 GMT+0200 (CEST)", webkitRelativePath: "", size: 3070778, type: "image/jpeg"});
	//console.log($('#file1').get(0).files[0]);
	createFileUploadRequest('upload_images', 'POST', 'upload_images', formData);
});

var API_URL = "http://localhost:3000/api/public/api/";
var $NAV, $CONSOLE;
var token;

function createRequest(label, type, route, data) {

	var $button = $('<div class="button">'+label+'</div>');
	
	$button.click(function() {
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

function createFileUploadRequest(label, type, route, data) {

	var $button = $('<div class="button">'+label+'</div>');
	
	$button.click(function() {
		$.ajax({
			url: API_URL+route,
			dataType: "json",
			type: type,
			xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                return myXhr;
            },
			data: data,
			cache: false,
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
		});
	}); 
	$NAV.append($button);
}

