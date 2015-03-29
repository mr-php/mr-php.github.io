---
layout: post
title: Image Cache using phpThumb and Mod_Rewrite
github_url: https://github.com/cornernote/php-image-cache
tags: [php, performance]
redirect_from:
- /code/image-cache-using-phpthumb-and-mod_rewrite/
---
Generate thumbs by visiting a URL such as `your.com/thumbs/50x50/images/image.jpg`.  This will create a 50x50px thumbnail of `your.com/images/image.jpg`.

The thumb will be stored on your server at `your.com/thumbs/50x50/images/image.jpg` so the next request for the same image will be loaded without loading php for ultra fast image cache.

<!--break-->

<h2>Introduction</h2>

About a year ago I came across a fantastic script called phpThumb.  It is an open source project used to resize images.  Sure you can do the same thing with tools such as GD2 or imagemagick (or magickwand), however its much nicer to not have to worry about those things and just focus on getting the right image with ease.

It was as easy as

```html
<img src="/phpthumb/phpThumb.php?src=myimage.jpg&w=100&h=100">
```

The problems started to arise on high-volume servers when apache had to get PHP to parse the phpThumb code for every image requested.  Sure it has caching but it still has to load PHP to decide if it should use the cache or not.

In the past I have seen this issue solved using <a href="http://httpd.apache.org/docs/current/mod/mod_rewrite.html">mod_rewrite</a> to redirect non-existent images to a script where they can be generated.  As a proof-of-concept I will provide the basic information required to get this running.

<h2>What you need</h2>
<ul>
<li>Apache</li>
<li>mod_rewrite</li>
<li>PHP</li>
</ul>

These things usually come with dedicated and shared hosting servers by default, however installation is beyond the scope of this article.

<h2>Ok, just tell me how to do it!</h2>

<h3>Upload phpThumb</h3>

<p>Download phpThumb from here:<br/>
<a href="http://phpthumb.sourceforge.net/">http://phpthumb.sourceforge.net/</a><p>

Upload phpThumb to `yoursite.com/phpthumb`


<h3>Setup Mod_Rewrite</h3>

Create `yoursite.com/thumbs/.htaccess`

```xml
<IfModule mod_rewrite.c>
  RewriteEngine on
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php?thumb=$1 [L,QSA]
</IfModule>
```


<h3>Create the Thumbnail Generator</h3>

Create `yoursite.com/thumbs/index.php`

```php
<?php
/**
 * Create a thumbnail
 *
 * @author Brett @ Mr PHP
 */
 
// define allowed image sizes
$sizes = array(
	'157x153',
	'600x600',
);

// ensure there was a thumb in the URL
if (!$_GET['thumb']) {
	error('no thumb');
}

// get the thumbnail from the URL
$thumb = strip_tags(htmlspecialchars($_GET['thumb']));

// get the image and size
$thumb_array = explode('/',$thumb);
$size = array_shift($thumb_array);
$image = '../'.implode('/',$thumb_array);
list($width,$height) = explode('x',$size);

// ensure the size is valid
if (!in_array($size,$sizes)) {
	error('invalid size');
}

// ensure the image file exists
if (!file_exists($image)) {
	error('no source image');
}

// generate the thumbnail
require('../phpthumb/phpthumb.class.php');
$phpThumb = new phpThumb();
$phpThumb->setSourceFilename($image);
$phpThumb->setParameter('w',$width);
$phpThumb->setParameter('h',$height);
$phpThumb->setParameter('f',substr($thumb,-3,3)); // set the output format
//$phpThumb->setParameter('far','C'); // scale outside
//$phpThumb->setParameter('bg','FFFFFF'); // scale outside
if (!$phpThumb->GenerateThumbnail()) {
	error('cannot generate thumbnail');
}

// make the directory to put the image
if (!mkpath(dirname($thumb),true)) {
        error('cannot create directory');
}

// write the file
if (!$phpThumb->RenderToFile($thumb)) {
	error('cannot save thumbnail');
}

// redirect to the thumb
// note: you need the '?new' or IE wont do a redirect
header('Location: '.dirname($_SERVER['SCRIPT_NAME']).'/'.$thumb.'?new');

// basic error handling
function error($error) {
	header("HTTP/1.0 404 Not Found");
	echo '<h1>Not Found</h1>';
	echo '<p>The image you requested could not be found.</p>';
	echo "<p>An error was triggered: <b>$error</b></p>";
	exit();
}
//recursive dir function
function mkpath($path, $mode){
    is_dir(dirname($path)) || mkpath(dirname($path), $mode);
    return is_dir($path) || @mkdir($path,0777,$mode);
}
```

<h3>Test it out!</h3>

Upload an image to `yoursite.com/images/myimage.jpg`.

Open your web browser to `yoursite.com/thumbs/100x100/images/myimage.jpg`

Check in your thumbs folder, the file should actually be there now.  Next time it is requested PHP will not be loaded.

Link to your thumbs like this:
```html
<img src="/thumbs/100x100/images/myimage.jpg">
```


<h3>Clearing Cache</h3>

This is a small script I use to delete all the cached thumbs.

Upload an image to `yoursite.com/thumbs/flush.php`.

```php
<?php

delete_dir('./images');
echo 'done';

function delete_dir($path) {
	$files = glob($path.'/*');
	foreach($files as $file) {
		if(is_dir($file) && !is_link($file)) {
			delete_dir($file);
		}
		else {
			unlink($file);
		}
	}
	if ($path!='./images') rmdir($path);
}
```
