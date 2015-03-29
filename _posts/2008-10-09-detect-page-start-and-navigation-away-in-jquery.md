---
layout: post
title: Detect Page Start and Navigation Away in jQuery
tags: [jquery]
redirect_from:
- /code/detect-page-start-and-navigation-away-in-jquery/
---
This quick snippet of jQuery that will allow you to so do something before the user navigates away from a page or closes the browser or tab.

In this example I have mixed in some JavaScript Date functionality to give a timer of how long you were on the page.

<!--break-->

```javascript
// get the starting date
var start = new Date();
var timeStart = 0;

// capture the start time with a mouseover on the document body
$(document).ready(function(){
	$("body").mouseover(function(){
		if (timeStart==0) {
			timeStart = start.getTime();
		}
	});
});

// bind a function to the window closing
$(window).bind("beforeunload", function(){
	alert("Leaving so soon? You were only here for "+timer()+" seconds."); 
});

// ask the user to confirm the window closing
window.onbeforeunload = function() {
	return "Leaving so soon? You were only here for "+timer()+" seconds."; 
}

// function to get the starting date
function timer() { 
	var end = new Date(); 
	var timeEnd = end.getTime();  
	return((timeEnd-timeStart)/1000); 
} 
```