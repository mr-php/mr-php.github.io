---
layout: post
title: Load CSV or Delimited Data from a File into a Named Array
tags: [php]
---
This small snippet will allow you to load CSV or other delimited Data from a File into a named array.  The heads in the CSV file will be used for the names of the array keys.

<!--break-->

```php
<?php

$filename = 'myfile.csv';
$delim = ","; // change to \t for tab delimited files

$handle = fopen($filename, "r");
$header = fgetcsv($handle,null,$delim);
while (($data = fgetcsv($handle,null,$delim)) !== FALSE) {
	foreach ($header as $key=>$heading) {
		$heading = trim($heading);
		$row[$heading]=(isset($data[$key])) ? $data[$key] : '';
	}
	// do something with the row
	print_r($row);
}
fclose($handle);
```