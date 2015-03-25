---
layout: post
title: View a Random Record in CakePHP
created: 1223134092
---
<p>This is a simple action to display a random record.  Possibly useful for sites wanting to keep people clicking on something.</p>
<!--break-->
<h2>The Controller</h2>
<p>We find a random record, and then we reuse the current view action and template.</p>
<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
class PostsController extends AppController {
	var $name = 'Posts';

	function random() {
		// $this->Post->contain(); // use this if you are using Containable
		$random = $this->Post->find('first',array(
			'conditions' => array(
				'Post.active'=>1,
			),
			'order' => 'rand()',
		));
		$this->view($random['Post']['id']);
		$this->render('view');
	}
}
</pre>
