---
layout: post
title: Merge Your CSS and JavaScript Using PHP
tags: [php, performance]
---
Merge all of your CSS and JS into one file to improve server speed.

<!--break-->

## Inside the body tags on your pages

```php
<link href="css/css.php?set=<?php echo base64_encode(serialize(array('screen','index','boxes'))); ?>" rel="stylesheet" type="text/css" />
<script language="javascript" type="text/javascript" src="js/js.php?set=<?php echo base64_encode(serialize(array('general','popup','tooltip'))); ?>"></script>
```

## CSS Loader

Create a file called `yoursite.com/css/css.php`:

```php
<?php 
header("Content-type: text/css");
if(isset($_GET['set'])) {
	$files = unserialize(base64_decode($_GET['set']));
	if (!empty($files)) {
		foreach($files as $file) {
			$contents = file_get_contents(dirname(__FILE__).'/'.basename($file).'.css');
			$data[] = $contents;
		}
	}
	echo implode("\n",$data);	
}
```

## JS Loader

Create a file called `yoursite.com/js/js.php`:

```php
<?php 
if(isset($_GET['set'])) {
	$files = unserialize(base64_decode($_GET['set']));
	if (!empty($files)) {
		foreach($files as $file) {
			$contents = file_get_contents(dirname(__FILE__).'/'.basename($file).'.js');
			$data[] = $contents;
		}
	}
	echo implode("\n",$data);	
}
```
