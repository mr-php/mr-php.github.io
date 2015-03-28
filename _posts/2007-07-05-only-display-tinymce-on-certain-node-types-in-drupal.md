---
layout: post
title: Only display TinyMCE on certain node types in Drupal
tags: [drupal]
---
This example will show you how to choose which node types use the TinyMCE module.

<!--break-->

Goto `Admin > Site configuration > TinyMCE`.

Click `edit` next to your profile.

Under the Visibility field group, select `Show if the following PHP code returns TRUE (PHP-mode, experts only).`

Enter the following code::

```php
# enter the node types that will use TinyMCE
$allowed = array('book','page','forum');

$use = FALSE;
if (arg(0) == 'node' && is_numeric(arg(1))) {
  $node = node_load(array('nid' => arg(1)));
  if (in_array($node->type,$allowed)) {
    $use = TRUE;
  }
}
foreach($allowed as $type) {
  if (strpos(request_uri(),"node/add/{$type}")){ $use = TRUE;}
}
return $use;
```

Now you can change the value of `$types = array('book','page','forum');` to decide where to display TinyMCE.
