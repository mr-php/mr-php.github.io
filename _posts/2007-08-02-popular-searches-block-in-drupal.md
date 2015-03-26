---
layout: post
title: Popular Searches Block in Drupal
created: 1186055629
---
This php code can be used in a drupal block to display the most popular searches on your site.

<!--break-->

```php
<?php

$query = "SELECT message from {watchdog} WHERE type = 'search'";
$result = db_query($query);
$search_strings = array();
while ($row = db_fetch_object($result)) {
  preg_match('/&lt;em>(.*)&lt;\/em>/', $row->message, $match);
  $string = strtolower($match[1]);
  $search_strings[$string] += 1;
}
if(count($search_strings)) {
  arsort($search_strings);
  $i = 0;
  foreach ($search_strings as $key => $val) {
    if ($i &lt; 10) {
      $i++;
      $query = preg_replace('/\s+/', '+', $key);
      $search_link = l($key,'search/node/'.$query);
      $search_link .= " ($val)";
      $items[] = $search_link;
    }
  }
  return theme('item_list',$items,'','ol');
}
```