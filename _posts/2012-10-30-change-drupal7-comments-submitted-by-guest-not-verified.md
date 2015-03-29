---
layout: post
title: Change Drupal7 Comments - Submitted by Guest (not verified)
tags: [drupal]
redirect_from:
- /code/change-drupal7-comments-submitted-by-guest-not-verified/
---
By default, if an anonymous user comments on some content in your drupal site, your comments box will show something like <strong>Submitted by Guest (not verified)</strong>.  The user may have left a username, so we would like to use that instead.

<!--break-->

In your theme's `template.php`, add this function:

```php
<?php
function yourtheme_username($variables) {
  $variables['extra'] = trim(str_replace('(not verified)','',$variables['extra']));
  if ($variables['account']->uid==0) {
    $variables['name'] = db_query_range("SELECT name FROM {comment} WHERE cid = :cid", 0, 1, array(':cid' => $variables['account']->cid))->fetchField();
	$variables['name'] = trim(htmlspecialchars($variables['name']));
	if (!$variables['name']) $variables['name'] = variable_get('anonymous', t('Anonymous'));
  }
  return theme_username($variables);
}
```
