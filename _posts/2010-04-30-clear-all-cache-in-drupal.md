---
layout: post
title: Clear All Cache in Drupal
created: 1272614651
---
<p>Quick code snippet, just drop this into clearcache.php and then load it in your browser.</p>

<!--break-->

<pre class="brush:php">
&lt;?php
include_once './includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
drupal_flush_all_caches();
</pre>
