---
layout: post
title: Word Permutator Function
created: 1216958873
---
Give this function a phrase and it will return all of the permutations of the words that make up the phrase.

<!--break-->

<h2>the function</h2>
<pre class="brush:php">
&lt;?php
function wordperms($phrase,$top='') {
	$output = array();
	
	if (is_array($phrase)) {
		$phrase_pieces = $phrase;
	}
	else {
		$phrase_pieces = explode(' ',$phrase);
	}
	$top_pieces = explode(' ',$top);
	foreach ($phrase_pieces as $piece) {
		if (!in_array($top.$piece,$output) && !in_array($piece,$top_pieces)) {
			$output[] = $top.$piece;
			$output = array_merge($output,wordperms($phrase_pieces,$top.$piece.' '));
		}
	}
	return $output;	
}
?>
</pre>

<h2>example</h2>
<pre class="brush:php">
&lt;?php
// example
print_r(wordperms("three word phrase"));
/*
Array
(
    [0] => three
    [1] => three word
    [2] => three word phrase
    [3] => three phrase
    [4] => three phrase word
    [5] => word
    [6] => word three
    [7] => word three phrase
    [8] => word phrase
    [9] => word phrase three
    [10] => phrase
    [11] => phrase three
    [12] => phrase three word
    [13] => phrase word
    [14] => phrase word three
)
*/
</pre>
