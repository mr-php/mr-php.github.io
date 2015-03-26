---
layout: post
title: SWFUpload with cPanel and mod_security
tags: [cpanel]
---
I searched long and hard to find what was causing swfupload to fail on my cPanel, but work on my test environment so I thought I better save the result incase I need it again.

<!--break-->

Edit `/etc/httpd/conf/js_modsecurity/useragents.conf`.  Simply remove the line below, or comment it out by putting a `#` in front of it.

```
SecRule HTTP_User-Agent  "^Shockwave Flash"
```
