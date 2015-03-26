---
layout: post
title: Inner Resize Browser Window
tags: [javascript]
---
This JavaScript function will resize the inside of a browser window to the dimensions provided.

<!--break-->

```javascript
function innerResizeWindow(innerWidth, innerHeight) {
	if (self.innerWidth) {
		myInnerWidth = self.innerWidth;
		myInnerHeight = self.innerHeight;
	}
	else if (document.documentElement && document.documentElement.clientWidth) {
		myInnerWidth = document.documentElement.clientWidth;
		myInnerHeight = document.documentElement.clientHeight;
	}
	else if (document.body) {
		myInnerWidth = document.body.clientWidth;
		myInnerHeight = document.body.clientHeight;
	}
	else {
		return;
	}
	adjustWidth = innerWidth - myInnerWidth;
	adjustHeight = innerHeight - myInnerHeight;
	window.resizeBy(adjustWidth, adjustHeight);
}
window.onload = innerResizeWindow(800,600);
```