---
layout: post
title: Clear All Cache in Drupal
tags: [drupal]
---
Quick code snippet, just drop this into clearcache.php and then load it in your browser.

<!--break-->

```php
<?php
include_once './includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
drupal_flush_all_caches();
```