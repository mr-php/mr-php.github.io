---
layout: post
title: Apache Expires Headers with mod_expires
tags: [performance]
---
Quick example of how to set default expires headers.  This will help prevent browsers from re-downloading the same images more than once and therefore reduce the load on your image server.

<!--break-->

Put this in your `.htaccess` file:

```xml
<IfModule mod_expires.c>
	ExpiresActive on
	ExpiresByType image/gif "access plus 1 years"
	ExpiresByType image/jpeg "access plus 1 years"
	ExpiresByType image/png "access plus 1 years" 
	ExpiresByType text/css "access plus 1 years"
	ExpiresByType text/js "access plus 1 years"
	ExpiresByType text/javascript "access plus 1 years"
	ExpiresByType application/javascript "access plus 1 years"
	ExpiresByType application/x-javascript "access plus 1 years" 
	#ExpiresDefault "access plus 1 days"
</IfModule>
```