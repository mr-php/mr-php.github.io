---
layout: post
title: View a Random Record in CakePHP
tags: [cakephp]
redirect_from:
- /code/view-a-random-record-in-cakephp/
---
This is a simple action to display a random record.  Possibly useful for sites wanting to keep people clicking on something.

<!--break-->

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
