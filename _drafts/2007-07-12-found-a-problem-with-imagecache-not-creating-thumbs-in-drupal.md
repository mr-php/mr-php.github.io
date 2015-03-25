---
layout: post
title: found a problem with imagecache not creating thumbs in drupal
created: 1184225504
---
<p>
I was building a site for a client and all imagecache stopped working before I uploaded to the live server.
</p>
<p>
When I uploaded, all of a sudden imagecache stopped working. I checked the usual things (permissions, original image exists) and everything was fine.
</p>
<!--break-->
<p>
After some debugging I found that:
</p>
<ul>
	<li> imagecache_cache() checks to see if the file exists using file_create_path()</li>
	<li>file_create_path() checks the temp directory before it checks the files/ directory using file_directory_temp()</li>
	<li>file_directory_temp() gets the temp directory using variable_get('file_directory_temp', NULL)</li>
</ul>
<p>
Great! So I go into the variables table and delete file_directory_temp.
</p>
<p>
But the problem is still there. Mre debugging:
</p>
<ul>
	<li>variable_get() can load variables from cache and not from the database using cache_get('variables', 'cache')</li>
</ul>
<p>
Ok, so I go into the cache table and delete variables.
</p>
<p>
Problem Solved! 
</p>
