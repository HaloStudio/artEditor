$(function() {
	"use strict";

    var headers = {};

    //add token and username in headers
    if(window.HaloSports_UserName) headers.username = window.HaloSports_UserName;
    else{
        var userName = window.localStorage.getItem('HaloSports_UserName');
        if(userName){
            window.HaloSports_UserName = userName;
            headers.username = window.HaloSports_UserName;
        }
    }
    if(window.HaloSports_AccessToken) headers.token = window.HaloSports_AccessToken;
    else{
        var token = window.localStorage.getItem('HaloSports_AccessToken');
        if(token){
            window.HaloSports_AccessToken = token;
            headers.token = window.HaloSports_AccessToken;
        }
    }

	$('#content').haloMobileEditor({
		imgTar: '#imageUpload',
        hook: '#text_content',
		limitSize: 3,   // 兆
		showServer: true,
		uploadUrl: 'http://www.ipaoto.com/uploadimg',
        contentType: 'application/json',
        headers: headers,
		data: headers,
		uploadField: 'image',
		placeholder: '<p>请输入活动内容</p>',
		validHtml: ["br"],
		uploadSuccess: function(res) {
			// return img url
			return res.path;
		},
		uploadError: function(res) {
			// something error
			console.log(res);
		}
	});

	$('i[action]').bind('click', function(){
		$('#content').haloMobileEditorAction(this.getAttribute('action'));
	});
	$('select[action]').bind('change', function(){
		$('#content').haloMobileEditorAction(this.getAttribute('action'), this.value);
	});
    $('select[action]').bind('click', function(){
        $('#content').haloMobileEditorAction(this.getAttribute('action'), this.value);
    });
	
	
});
