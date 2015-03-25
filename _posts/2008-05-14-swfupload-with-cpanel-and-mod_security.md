---
layout: post
title: SWFUpload with cPanel and mod_security
created: 1210754343
---
I searched long and hard to find what was causing swfupload to fail on my cPanel, but work on my test environment so I thought I better save the result incase I need it again.
<!--break-->


Edit <code>/etc/httpd/conf/js_modsecurity/useragents.conf</code>.  Simply remove the line below, or comment it out by putting a # in front of it.

<pre class="brush:plain">
SecRule HTTP_User-Agent  "^Shockwave Flash"
</pre>
