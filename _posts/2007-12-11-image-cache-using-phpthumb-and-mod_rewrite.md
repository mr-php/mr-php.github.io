---
layout: post
title: Image Cache using phpThumb and Mod_Rewrite
created: 1197347549
---
<p>Generate thumbs by visiting a URL such as <code>your.com/thumbs/50x50/images/image.jpg</code>.  This will create a 50x50px thumbnail of <code>your.com/images/image.jpg</code>.</p>

<p>The thumb will be stored on your server at <code>your.com/thumbs/50x50/images/image.jpg</code> so the next request for the same image will be loaded without loading php for ultra fast image cache.</p>

<!--break-->

<h2>Introduction</h2>

<p>About a year ago I came across a fantastic script called phpThumb.  It is an open source project used to resize images.  Sure you can do the same thing with tools such as GD2 or imagemagick (or magickwand), however its much nicer to not have to worry about those things and just focus on getting the right image with ease.</p>

<p>It was as easy as</p>
<pre class="brush: html">
&lt;img src="/phpthumb/phpThumb.php?src=myimage.jpg&w=100&h=100">
</pre>

<p>The problems started to arise on high-volume servers when apache had to get PHP to parse the phpThumb code for every image requested.  Sure it has caching but it still has to load PHP to decide if it should use the cache or not.</p>

<p>In the past I have seen this issue solved using <a href="http://httpd.apache.org/docs/current/mod/mod_rewrite.html">mod_rewrite</a> to redirect non-existent images to a script where they can be generated.  As a proof-of-concept I will provide the basic information required to get this running.</p>

<h2>What you need</h2>
<ul>
<li>Apache</li>
<li>mod_rewrite</li>
<li>PHP</li>
</ul>

<p>These things usually come with dedicated and shared hosting servers by default, however installation is beyond the scope of this article.</p>

<h2>Ok, just tell me how to do it!</h2>

<h3>Upload phpThumb</h3>

<p>Download phpThumb from here:<br/>
<a href="http://phpthumb.sourceforge.net/">http://phpthumb.sourceforge.net/</a><p>

<p>Upload phpThumb to <i>yoursite.com/phpthumb</i></p>


<h3>Setup Mod_Rewrite</h3>

<p>Create <i>yoursite.com/thumbs/.htaccess</i></p>
<pre class="brush: xml">
&lt;IfModule mod_rewrite.c>
  RewriteEngine on
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php?thumb=$1 [L,QSA]
&lt;/IfModule>
</pre>


<h3>Create the Thumbnail Generator</h3>

<p>Create <code>yoursite.com/thumbs/index.php</code></p>
<pre class="brush: php">
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
	echo '&lt;h1>Not Found&lt;/h1>';
	echo '<p>The image you requested could not be found.</p>';
	echo "<p>An error was triggered: <b>$error</b></p>";
	exit();
}
//recursive dir function
function mkpath($path, $mode){
    is_dir(dirname($path)) || mkpath(dirname($path), $mode);
    return is_dir($path) || @mkdir($path,0777,$mode);
}
</pre>

<h3>Test it out!</h3>

<p>Upload an image to <i>yoursite.com/images/myimage.jpg</i></p>

<p>Open your web browser to <i>yoursite.com/thumbs/100x100/images/myimage.jpg</i></p>

<p>Check in your thumbs folder, the file should actually be there now.  Next time it is requested PHP will not be loaded.</p>

<p>Link to your thumbs like this:</p>

<pre class="brush: xml">
&lt;img src="/thumbs/100x100/images/myimage.jpg">
</pre>



<h3>Clearing Cache</h3>

<p>This is a small script I use to delete all the cached thumbs.</p>

<p>Upload an image to <i>yoursite.com/thumbs/flush.php</i></p>

<pre class="brush: php">
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
</pre>


<a href="https://github.com/cornernote/php-image-cache"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"></a>
