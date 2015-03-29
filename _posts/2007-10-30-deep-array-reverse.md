---
layout: post
title: Deep Array Reverse
tags: [php]
redirect_from:
- /code/deep-array-reverse/
---
Recursively reverses a multi-depth array.

<!--break-->

```php
<?php

function deep_array_reverse($data)
{
  $output = array();
  $keys = array_keys($data);
  for ($i=count($data)-1; $i>=0; $i--)
  {
    if (is_array($data[$keys[$i]]))
    {
      $output[$keys[$i]] = deep_array_reverse($data[$keys[$i]]);
    }
    else
    {
      $output[$keys[$i]] = $data[$keys[$i]];
    }
 }
 return $output;
}
```