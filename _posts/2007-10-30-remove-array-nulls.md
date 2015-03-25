---
layout: post
title: Remove Array Nulls
created: 1193738952
---
<p>Recursively removes array keys with null values.</p>
<!--break-->


<pre class="brush:php">
function remove_array_nulls($data)
{
  foreach ($data as $key=>$value)
  {
    if (is_array($data[$key]))
    {
      $output[$key] = remove_array_nulls($value);
    }
    elseif ($data[$key] || $data[$key]===0)
    {
      $output[$key] = $value;
    }
  }
  return $output;
}
</pre>
