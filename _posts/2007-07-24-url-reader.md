---
layout: post
title: URL Reader
tags: [php]
redirect_from:
- /code/url-reader/
---
This function will download the contents of any URL and return it as a string that you can save to a file or database.

It will use curl if it is installed.  Otherwise it will use fopen/fread.

<!--break-->

```php
<?php

function url_reader($url,$referer=null) {
  if (function_exists('curl_init')) {
    $ch  =  curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    if ($referer) {
      curl_setopt($ch, CURLOPT_REFERER, $referer);
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $data = curl_exec($ch);
    curl_close($ch);
  }
  else {
    $data = '';
    $handle = fopen($url,'rb');
    while (!feof($handle)) {
      $data .= fread($handle, 8192);
    }
    fclose($handle);
  }
  return $data;
}
```