---
layout: post
title: Fully Qualified Domain Name and Base Path
created: 1190464006
---
This simple snippet will provide you with a HTTP or HTTPS Fully Qualified Domain Name URL and Base Path to your CakePHP installation.  I use it for the HTML base tag.
<!--break-->

Thanks to Nate for pointing out the best way to do this in CakePHP 1.2:
<pre class="brush:php; html-script:true">
&lt;base href="&lt;?php echo Router::url("/", true); >" />
</pre>

For historical purposes, here is the CakePHP 1.1 way of doing it.
<pre class="brush:php; html-script:true">
&lt;base href="&lt;?php echo (env('HTTPS') ? 'https://' : 'http://') . env('HTTP_HOST') . $this->webroot; ?>" />
</pre>
