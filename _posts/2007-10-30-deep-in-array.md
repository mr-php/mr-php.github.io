---
layout: post
title: Deep In Array
created: 1193738530
---
<p>Function similar to in_array() but it recursively searches a multi-depth array.</p>

<!--break-->
<pre class="brush:php">
function deep_in_array($value, $array, $case_insensitive = false)
{
  foreach($array as $item)
  {
    if (is_array($item))
    {
      $output = deep_in_array($value, $item, $case_insensitive);
    }
    else
    {
      $output = ($case_insensitive) ? strtolower($item)==$value : $item==$value;
    }
    if ($output)
    {
      return $output;
    }
  }
  return false;
}
</pre>
