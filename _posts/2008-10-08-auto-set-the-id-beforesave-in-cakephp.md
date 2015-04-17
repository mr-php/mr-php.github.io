---
layout: post
title: Auto-Set the ID beforeSave in CakePHP
excerpt: In this quick snippet of code I will be setting the ID of a model based on other fields given. We want to save a note about each Post that is different for every Client, however we do not want to have to get the ID every time we save the data.
tags: [cakephp]
redirect_from:
- /blog/auto-set-id-beforesave-cakephp/
- /code/auto-set-id-beforesave-cakephp/
- /code/auto-set-the-id-beforesave-in-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>. If you notice any changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

In this quick snippet of code I will be setting the ID of a model based on other fields given.

We want to save a note about each Post that is different for every Client, however we do not want to have to get the ID every time we save the data.


## The Tables

```sql
CREATE TABLE IF NOT EXISTS `clients_to_posts` (
  `id` int(11) NOT NULL auto_increment,
  `client_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `clientpost` (`client_id`,`post_id`)
);
```


## The Models

`models/post.php`

```php
<?php
class Post extends AppModel {
	var $name = 'Post';

	var $hasMany = array(
		'PostToClient' => array(
			'className' => 'PostToClient',
			'foreignKey' => 'post_id',
		),
	);
}
?>
```

`models/client_to_post.php`

```php
<?php
class ClientToPost extends AppModel {
	var $name = 'ClientToPost';
	var $useTable = 'clients_to_posts';
	var $primaryKey = 'id';

	var $belongsTo = array(
		'Post' => array(
			'className' => 'Post',
			'foreignKey' => 'post_id',
		),
		'Client' => array(
			'className' => 'Client',
			'foreignKey' => 'client_id',
		),
	);

	function beforeValidate() {
		$this->setExistingId();
		return true;
	}
	
	function beforeSave() {
		$this->setExistingId();
		return true;
	}
		
	
	/**
	 * tries to set an existing id (used in beforeSave/beforeValidate)
	 *
	 */
	function setExistingId() {
		if (!$this->id) {
			$d = $this->data[$this->alias];
			if ((isset($d['post_id']) && $d['post_id']) && (isset($d['client_id']) && $d['client_id'])) {
				$conditions = array();
				$conditions[$this->alias.'.post_id'] = $d['post_id']; 
				$conditions[$this->alias.'.client_id'] = $d['client_id']; 
				$this->recursive = -1;
				$id = $this->field($this->primaryKey,$conditions);
				if ($id) {
					$this->exists(true);
					$this->id = $this->data[$this->alias][$this->primaryKey] = $id;
				}
			}
		}
	}
	
}
```



## The Controller

`controllers/posts_controller.php`

```php
<?php
class PostsController extends AppController
	var $name = 'Posts';

	function test() {
		// do not render a view, for testing
		$this->autoRender = false;

		// set the data to save
		$data = array(
			'ClientToPost' => array(
				// if you do not set an id, it will be auto-set if a matching row exists
				// 'id' => 1,
				'post_id' => 123,
				'client_id' => 456,
				'notes' => 'this is a note',
			),
		);

		// save the data, no row exists so a new row will be created
		$this->Post->ClientToPost->save($data);

		// save the data again, as a row exists with the given post/client it will be updated
		$this->Post->ClientToPost->save($data);
	}	
}
```
