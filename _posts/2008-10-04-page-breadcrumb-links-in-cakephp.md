---
layout: post
title: Page Breadcrumb Links in CakePHP
excerpt: "I wanted to make a quick and easy breadcrumb that worked with a simple array. The breadcrumb is an array containing multiple links from <code>html_helper::link()</code>."
tags: [cakephp]
redirect_from:
- /blog/page-breadcrumb-links-cakephp/
- /code/page-breadcrumb-links-cakephp/
- /code/page-breadcrumb-links-in-cakephp/
- /code/code-category/cakephp/cakephp-1-2/page-breadcrumb-links-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>.</p>
	<p>If you notice any other changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

I wanted to make a quick and easy breadcrumb that worked with a simple array.

The breadcrumb is an array containing multiple links from `html_helper::link()`.

<!--break-->

## The Models

For this example we need to have a category with the Tree behaviour.

`models/post.php`

```php
<?php
class Post extends AppModel {
	var $name = 'Post';
	var $belongsTo = array(
		'Category' => array(
			'className' => 'Category',
			'foreignKey' => 'category_id',
		),
	);                
}
```

`models/category.php`

```php
<?php
class Category extends AppModel {
	var $name = 'Category';
	var $actsAs = array('Tree');
}
```

## The Controllers

I will provide the controller action for posts::view(), however you can use this on any and every action.

`controllers/posts_controller.php`

```php
<?php
class PostsController extends AppController {
	var $name = 'Posts';

	function view($id = null) {
		if (!$id) {
			$this->_flash(__('Invalid Post.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
		
		// load the post
		$post = $this->Post->read(null, $id);

		// set the category path
		$post['CategoryPath'] = $this->Post->Category->getPath($post['Post']['category_id']); 
		$post['CategoryPath'] = $post['CategoryPath']?$post['CategoryPath']:array(); 

		// set page title
		$title = $post['Post']['name'];
		
		// set breadcrumb
		$breadcrumb = array();
		$breadcrumb[] = $html->link(__('Home',true),'/');
		$breadcrumb[] = $html->link(__('Posts',true),array('controller'=>'posts','action'=>'index'));
 		foreach ($post['CategoryPath'] as $category) {
			$breadcrumb[] = $html->link(__($category['Category']['name'],true),array(
				'controller'=>'posts',
				'action'=>'index',
				'category_id'=>$category['Category']['id']
			));
		}
		$breadcrumb[] = $title;

		// set page variables
		$this->set(compact('post','title','breadcrumb'));
	}
}
```

## The View

The view is very simple.

`views/layout/default.ctp`

```php
<?php if (isset($breadcrumb)): ?>
	<div id="breadcrumb"><?php echo implode(' &raquo; ',$breadcrumb); ?></div>
<?php endif; ?>
```
