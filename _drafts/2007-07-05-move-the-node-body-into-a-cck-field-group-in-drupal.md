---
layout: post
title: Move the Node Body into a CCK Field Group in Drupal
created: 1183632313
excerpt: ! 'This code snippet will put the node body into a CCK Field Group for selected
  node types. '
---
<p>This code snippet will put the node body into a CCK Field Group for selected node types. </p>

<p>You will need to create the following files.</p>

<strong>mymodule.info</strong>
<pre class="brush:plain">
name = My Module
package = My Module
description = My module override functions.
version = "5.x-1"
project = "mymodule"
</pre>


<strong>mymodule.module </strong>
<pre class="brush:php">
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
</pre>

<p>You will have to change this code: <strong>$types = array('story'=&gt;'group_details','book'=&gt;'group_information');</strong></p>

<p>The format is <code>$types = array('[NODE TYPE]'=&gt;'[FIELD GROUP]'); </code> where [NODE TYPE] is the type of node and [FIELD GROUP] is the name of the field group where the body will be moved to.</p>

<p>Upload these files to <code>sites/all/modules/mymodule</code></p>

<p>Go to  <strong>Admin &gt; Site Building &gt; Modules</strong> and enable your new module.</p>
