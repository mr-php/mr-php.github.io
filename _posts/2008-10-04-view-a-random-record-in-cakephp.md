---
layout: post
title: View a Random Record in CakePHP
excerpt: This is a simple action to display a random record.  Possibly useful for sites wanting to keep people clicking on something.
tags: [cakephp]
redirect_from:
- /blog/view-random-record-cakephp/
- /code/view-random-record-cakephp/
- /code/view-a-random-record-in-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>.</p>
	<p>If you notice any changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

This is a simple action to display a random record.  Possibly useful for sites wanting to keep people clicking on something.


## The Controller

We find a random record, and then we reuse the current view action and template.

`controllers/posts_controller.php`

```php
<?php
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
```
