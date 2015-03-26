---
layout: post
title: Remove Array Nulls
---
Recursively removes array keys with null values.
<!--break-->

```php
<?php

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
```