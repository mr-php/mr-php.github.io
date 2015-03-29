---
layout: post
title: Display Blocks On Specified Node Types in Drupal
tags: [drupal]
redirect_from:
- /code/display-blocks-on-specified-node-types-in-drupal/
---

This code snippet will allow you to only display a block on the node types you select.  Simply paste into the PHP options.

<!--break-->

```php
<?php

$types = array('page','story');

$match = FALSE;
if (arg(0) == 'node' && is_numeric(arg(1))) {
  $nid = arg(1);
  $node = node_load(array('nid' => $nid));
  $type = $node->type;
  if (in_array($type,$types)) {
    $match = TRUE;
  }
}
return $match;
```