---
layout: post
title: How to Remove Google Banner Ads in CreLoaded 6.2
created: 1185189799
---
<p>Would you like to remove that google advertising that CRE Loaded has added to your site in a way that is tricky to find?</p>

<!--break-->
<p>Open this file: <code>/includes/javascript/cart_links.js.php</code></p>

<p>Remove this code:</p>
<pre class="brush:php">
echo '&lt;table width="100%" cellspacing="3" cellpadding="' .CELLPADDING_MAIN . '">&lt;tr>';
echo '&lt;td width="100%" style="text-align: center">';
include('http://creloaded.com/cre_google.js');
echo '&lt;/td>&lt;/tr>&lt;/table>';
</pre>
