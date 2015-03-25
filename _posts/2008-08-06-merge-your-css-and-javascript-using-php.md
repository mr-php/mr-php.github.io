---
layout: post
title: Merge Your CSS and JavaScript Using PHP
created: 1218041290
---
<p>Merge all of your CSS and JS into one file to improve server speed.</p>

<!--break-->

<h3>Inside the body tags on your pages</h3>
<pre class="brush:php; html-script:true">
&lt;link href="css/css.php?set=&lt;?php echo base64_encode(serialize(array('screen','index','boxes'))); ?>" rel="stylesheet" type="text/css" />
&lt;script language="javascript" type="text/javascript" src="js/js.php?set=&lt;?php echo base64_encode(serialize(array('general','popup','tooltip'))); ?>">&lt;/script>
</pre>

<h3>yoursite.com/css/css.php</h3>
<pre class="brush:php">
&lt;?php 
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
</pre>

<h3>yoursite.com/js/js.php</h3>
<pre class="brush:php">
&lt;?php 
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
</pre>
