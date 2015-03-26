---
layout: post
title: Cache Function for PHP
github_url: https://github.com/cornernote/php-cache-function
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

## The Function

```php
<?php

// prevent conflicts between different applications using the same memcache server
define('CACHE_NAMESPACE','my-cache-namespace');

// if memcache is not available this folder will be used to store cache
define('CACHE_FOLDER','/tmp/cache/');

// memcache server hostname
define('CACHE_MEMCACHE_HOST','localhost');

// memcache server port
define('CACHE_MEMCACHE_PORT','11211');

/**
 * cache()
 * Read, Write or Clear cached data using a key value pair. 
 * 
 * @param string $key - the key to use to store and retrieve the cached data
 * @param mixed $value - the data to store in cache
 * @param string $expires - the expirey time of the data
 * @return mixed - the cached data to return
**/
function cache($key,$value=null,$expires='+1 year'){
	// static variables allowing the function to run faster when called multiple times
	static $cache_id, $memcache;

	// get the cache_id used for easy cache clearing
	if ($key != 'cache_id') {
		if (!$cache_id) {
			$cache_id = cache('cache_id',null);
		}
		if (!$cache_id) {
			$cache_id = md5(microtime());
			cache('cache_id',$cache_id);
		}
		$file = CACHE_NAMESPACE.'.'.$cache_id.'.'.$key;
	}
	else {
		$file = CACHE_NAMESPACE.'.'.$key;
	}

	// set the expire time
	$now = time();
	if (!is_numeric($expires)) {
		$expires = strtotime($expires, $now);
	}

	// attempt connection to memcache
	if ($memcache===null) {
		if (class_exists('Memcache')) {
			if (!$memcache) {
				$memcache = new Memcache;
				@$memcache->connect(CACHE_MEMCACHE_HOST, CACHE_MEMCACHE_PORT) or ($memcache=false);
			}
		}
	}

	// handle cache using memcache
	if ($memcache) {
		// read cache
		if ($value===null) {
			$time = $memcache->get($file.'.time');
			if (!$expires || $time <= $now) {
				$memcache->delete($file.'.time');
				$memcache->delete($file.'.data');
			}
			else {
				$value = $memcache->get($file.'.data');
				if ($value===false) $value = null;
			}
		}
		// write cache
		else {
			$memcache->set($file.'.data', $value);
			$memcache->set($file.'.time', $expires);
		}
	}

	// handle cache using files
	else {
		$md5 = md5($key);
		$file = CACHE_FOLDER.substr($md5,0,1).'/'.substr($md5,0,2).'/'.substr($md5,0,3).'/'.$file;
		// read cache
		if ($value===null) {
			if (file_exists($file)) {
				$result = unserialize(file_get_contents($file));
				if (!$expires || $result['time'] <= $now) {
					@unlink($file);
				}
				else {
					$value = $result['data'];
				}
			}
		}
		// write cache
		else {
			if (!file_exists(dirname($file))){
				mkdir(dirname($file),0700,true);
			}
			file_put_contents($file, serialize(array('data'=>$value,'time'=>$expires)));
		}
	}

	// return the data
	return $value;
}
```
