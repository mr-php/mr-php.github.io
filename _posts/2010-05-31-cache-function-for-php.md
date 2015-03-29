---
layout: post
title: Cache Function for PHP
github_url: https://github.com/cornernote/php-cache-function
tags: [php, performance]
redirect_from:
- /blog/cache-function-php/
- /code/cache-function-php/
- /code/cache-function-for-php/
---
This is a fantastic function that will allow you to cache your data.  By default it will cache using memcache, however if you do not have memcache installed or a connection cannot be achieved it will fall back to file based cache.

The single function supports cache read, cache write, cache clear key and cache clear all.  The cached data can be given an expirey time so that your data does not become stale.

Usage is very simple and the performance results of caching using memcache are fantastic.

<!--break-->

## Example Usage

```php
<?php
require('cache.php');

// start the page timer to see how much time we saved
$start = microtime_float();

// set the cache key
$key = 'some-cached-element';

// read cache
$data = cache($key);
if ($data===null) {

	// read failed, get the data from database or other slow storage location
	$data = array('some'=>'data','more'=>'stuff');
	sleep(5);

	// write cache
	cache($key,$data,'+30 seconds');

}

// clear this cache key
#cache($key,null,0);

// clear all cache
#cache('cache_id',null,0);

// calculate the running time and output the data
$time = microtime_float() - $start;
debug($time);

// output the data
debug($data);

// helper functions
function microtime_float() {
	list($usec, $sec) = explode(" ", microtime());
	return ((float)$usec + (float)$sec);
}
function debug($debug) {
	echo '<pre>';
	print_r($debug);
	echo '</pre>';
}
```
