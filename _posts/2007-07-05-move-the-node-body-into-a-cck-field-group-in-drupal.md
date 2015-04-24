---
layout: post
title: Move the Node Body into a CCK Field Group in Drupal
tags: [drupal]
redirect_from:
- /code/move-the-node-body-into-a-cck-field-group-in-drupal/
---

This code snippet will put the node body into a CCK Field Group for selected node types.

<!--break-->

You will need to create the following files.

`mymodule.info`

```
name = My Module
package = My Module
description = My module override functions.
version = "5.x-1"
project = "mymodule"
```


`mymodule.module`

```php
function mymodule_nodeapi(&$node, $op, $teaser = NULL, $page = NULL) {
  // move body into group_details in teaser
  $types = array('blog'=>'group_details','story'=>'group_details');
  foreach($types as $type=>$field_group) {
    if ($op=='view' && $node->type==$type && $teaser && isset($node->content[$field_group])) {
      $node->content[$field_group]['body'] = $node->content['body'];
      unset($node->content['body']);
      break;
    }
  }
} 
```

You will have to change this code: `$types = array('story'=>'group_details','book'=>'group_information');`.

The format is `$types = array('[NODE TYPE]'=>'[FIELD GROUP]');` where `[NODE TYPE]` is the type of node and `[FIELD GROUP]` is the name of the field group where the body will be moved to.

Upload these files to `sites/all/modules/mymodule`.

Go to `Admin > Site Building > Modules` and enable your new module.
