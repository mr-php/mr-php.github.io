---
layout: post
title: Importing Data from CSV into CakePHP
excerpt: This is a quick little method that lets you get some data from a CSV into a table. It should work with very large CSV files as it only has to read one row at a time.
tags: [cakephp]
redirect_from:
- /blog/importing-data-csv-cakephp/
- /code/importing-data-csv-cakephp/
- /code/importing-data-from-csv-into-cakephp/
- /code/code-category/cakephp/cakephp-1-2/importing-data-csv-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>. If you notice any changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

This is a quick little method that lets you get some data from a CSV into a table.

It should work with very large CSV files as it only has to read one row at a time.


## The Data

`tmp/uploads/Post/posts.csv`

```
Post.title, Post.description
My First Post, great posting with lots of information
Another Post, another interesting article
```


## The Controller

`controllers/posts_controller.php`

```php
<?php
class PostsController extends AppController {
	var $name = 'Posts';

	function import() {
		$messages = $this->Post->import('posts.csv');
		debug($messages);
	}
}
?>
```


## The Model

`models/post.php`

```php
<?php
class Post extends AppModel {
	var $name = 'Post';

	function import($filename) {
 		// to avoid having to tweak the contents of 
 		// $data you should use your db field name as the heading name 
		// eg: Post.id, Post.title, Post.description

		// set the filename to read CSV from
		$filename = TMP . 'uploads' . DS . 'Post' . DS . $filename;
		
		// open the file
 		$handle = fopen($filename, "r");
 		
 		// read the 1st row as headings
 		$header = fgetcsv($handle);
 		
		// create a message container
		$return = array(
			'messages' => array(),
			'errors' => array(),
		);

 		// read each data row in the file
 		while (($row = fgetcsv($handle)) !== FALSE) {
 			$i++;
 			$data = array();

 			// for each header field 
 			foreach ($header as $k=>$head) {
 				// get the data field from Model.field
 				if (strpos($head,'.')!==false) {
	 				$h = explode('.',$head);
	 				$data[$h[0]][$h[1]]=(isset($row[$k])) ? $row[$k] : '';
				}
 				// get the data field from field
				else {
	 				$data['Post'][$head]=(isset($row[$k])) ? $row[$k] : '';
				}
 			}

			// see if we have an id 			
 			$id = isset($data['Post']['id']) ? $data['Post']['id'] : 0;

			// we have an id, so we update
 			if ($id) {
 				// there is 2 options here, 
				 
				// option 1:
				// load the current row, and merge it with the new data
	 			//$this->recursive = -1;
	 			//$post = $this->read(null,$id);
	 			//$data['Post'] = array_merge($post['Post'],$data['Post']);
	 			
				// option 2:
	 			// set the model id
	 			$this->id = $id;
			}
			
			// or create a new record
			else {
	 			$this->create();
			}
 			
			// see what we have
			// debug($data);
			
 			// validate the row
			$this->set($data);
			if (!$this->validates()) {
				$this->_flash(,'warning');
				$return['errors'][] = __(sprintf('Post for Row %d failed to validate.',$i), true);
			}

 			// save the row
			if (!$error && !$this->save($data)) {
				$return['errors'][] = __(sprintf('Post for Row %d failed to save.',$i), true);
			}

 			// success message!
			if (!$error) {
				$return['messages'][] = __(sprintf('Post for Row %d was saved.',$i), true);
			}
 		}
 		
 		// close the file
 		fclose($handle);
 		
 		// return the messages
 		return $return;
 		
	}

}
```
