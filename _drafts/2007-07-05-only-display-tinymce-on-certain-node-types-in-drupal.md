---
layout: post
title: Only display TinyMCE on certain node types in Drupal
created: 1183616644
excerpt: This example will show you how to choose which node types use the TinyMCE
  module.
---
<p>This example will show you how to choose which node types use the TinyMCE module.</p>

<p>Goto <strong>Admin > Site configuration > TinyMCE</strong></p>

<p>Click <strong>edit</strong> next to your profile.</p>

<p>Under the Visibility field group, select <strong>Show if the following PHP code returns TRUE (PHP-mode, experts only).</strong></p>

<strong>Enter the following code:</strong>:

<pre class="brush:php">
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
</pre>

<p>Thats all!</p>

<p>Now you can change the value of <strong>$types = array('book','page','forum');</strong> to decide where to display TinyMCE.</p>
