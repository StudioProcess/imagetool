$(document).ready(function() {
	console.log("up & running..");
	
	$NAV = $('.nav');
	$CONSOLE = $('.output');	
	
	createRequest('test', 'GET', 'user',
		{
			"email":"crux23@gmail.com",
			//"password":"12345678"
		}
	);
	
	createRequest('register', 'POST', 'register',
		{
			"name":"Michael",
			"email":"crux23@gmail.com",
			"password":"12345678"
		}
	);
	createRequest('login - invalid', 'POST', 'login',
		{
			"email":"crux23@gmail.com",
			"password":"xxxxxxxx"
		}
	);
	createRequest('login - valid', 'POST', 'login',
		{
			"email":"crux23@gmail.com",
			"password":"12345678"
		}
	);
	createRequest('get user details - invalid token', 'POST', 'get_user_details',
		{
			"token":"kjhkhkhiohöjkh43kjhrlh3z3ufhiruehifuhweiughfeiguiegwiu"
		}
	);
	createRequest('get user details', 'POST', 'get_user_details',
		{
			"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHA6XC9cL2l0by5wcm9jZXNzLnN0dWRpb1wvYXBpXC9wdWJsaWNcL2FwaVwvbG9naW4iLCJpYXQiOjE0NzM0MzM5NjYsImV4cCI6MTQ3MzQzNzU2NiwibmJmIjoxNDczNDMzOTY2LCJqdGkiOiI3ZGE0MDRkY2RiN2ViNDM1OTc1MjE3YzlmYTFmOWQzNyJ9.dxCUJPsNUhkRXchO0OPGaxsYWrEh1eGHdnlHfFVQ8LQ"
		}
	);
	createRequest('get user details - no data', 'POST', 'get_user_details',
		{
		}
	);
});

var API_URL = "http://localhost:3000/api/public/api/";
var $NAV, $CONSOLE;

function createRequest(label, type, route, data) {

	var $button = $('<div class="button">'+label+'</div>');
	
	$button.click(function() {
		$.ajax({
			url: API_URL+route,
			dataType: "json",
			type: type,
			data: data,
			success: function (data) {
				$CONSOLE.html('success<br/><br/>status: '+data.status+'<br/>message: '+data.message+'<br/><br/>data:<br/>'+JSON.stringify(data.data));
				console.log(API_URL+route);
				console.log(data);
			},
			error: function (data) {
				$CONSOLE.html('error<br/><br/>status: '+data.status+'<br/>statusText: '+data.statusText+'<br/><br/>responseText:<br/><br/>'+data.responseText);
				console.log(API_URL+route);
				console.log(data);
			},
		});
	}); 
	$NAV.append($button);
}

