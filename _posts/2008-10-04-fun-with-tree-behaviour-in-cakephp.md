---
layout: post
title: Fun with Tree Behaviour in CakePHP
tags: [cakephp]
---
I had a play with the Tree Behaviour in CakePHP and was very impressed at what you could create with such ease.

<!--break-->

## The Models

Before we get started, lets setup the models.

Category needs to have the Tree behaviour, and we also add a new function to count the related Post records.

`models/category.php`
```php
<?php
class Category extends AppModel {
	var $name = 'Category';
	var $actsAs = array('Tree');

	var $hasMany = array(
		'Post' => array(
			'className' => 'Post',
			'foreignKey' => 'category_id',
		),
	);
	function postCount($id, $direct=false){
		if (!$direct) {
			$ids = array($id);
			$children = $this->children($id);
			foreach ($children as $child) {
				$ids[] = $child['Category']['id'];
			}
			$id = $ids;
		}
		$this->Post->recursive = -1;
		return $this->Post->findCount(array('category_id'=>$id));
	}

}
?>
```

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
?>
```

## Setting Up the Data

If you are like me, you probably already have your categories in a table with a parent_id style hierarchy.

In order to get started you need to add a lft and rght column to the table, and then populate the fields.  Luckily there is an easy way to do this.

`controllers/categories_controller.php`

```php
<?php
class CategoriesController extends AppController {
	var $name = 'Categories';
	function recover() {
		set_time_limit(60*60*24);
		$this->autoRender = false;
		$this->Category->recover();
		echo 'recovery completed...';
	}
}
``

## Finding Your Data

It is now very easy to get your data, and also very light on the database.

`controllers/categories_controller.php`

```php
<?php
class CategoriesController extends AppController {
	var $name = 'Categories';

	function index() {
		$this->autoRender = false;
		
		// get a threaded list, for threaded categories output
		$threaded = $this->Category->find('threaded');
		debug($threaded);		
		
		// get a flat list, for select input
        $categories = $this->Category->generatetreelist(null, null, null, ' --| ');
		debug($categories);		
		
		// get a list of parents to the top, for breadcrumb
		$id = 123;
		$path = $this->Video->Category->getPath($id);
		debug($path); 

		// count the direct children
		$id = 123;
		$childCountDirect = $this->Category->childCount($id,true); 
		debug($childCountDirect); 
		
		// count the children and all subchildren recursively 
		$id = 123;
		$childCount = $this->Category->childCount($id); 
		debug($childCount); 

		// count the posts in the given category
		$id = 123;
		$postCountDirect = $this->Category->postCount($id,true); 
		debug($postCountDirect); 
		
		// count the posts in the given category and all subchildren recursively
		$id = 123;
		$postCount = $this->Category->postCount($id); 
		debug($postCount); 
	}
}
```
