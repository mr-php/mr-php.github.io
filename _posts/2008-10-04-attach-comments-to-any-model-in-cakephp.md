---
layout: post
title: Attach Comments to Any Model in CakePHP
tags: [cakephp]
redirect_from:
- /blog/attach-comments-any-model-cakephp/
- /code/attach-comments-any-model-cakephp/
- /code/attach-comments-to-any-model-in-cakephp/
---
This method of linking models allows you to have a single table of data, say Comment, that is related to any one of a number of other Models (eg: Post, Event).

<!--break-->

## The Tables

```sql
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL auto_increment,
  `class` varchar(128) NOT NULL,
  `foreign_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `body` text,
  PRIMARY KEY  (`id`)
);
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
);
CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
);
```

## The Models

Before we get started, lets setup the models.

`models/comment.php`

```php
<?php
class Comment extends AppModel {
	var $name = 'Comment';
}
```

`models/post.php`

```php
<?php
class Post extends AppModel {
	var $name = 'Post';
	var $hasMany = array(
		'Comment' => array(
			'className' => 'Comment',
			'foreignKey' => 'foreign_id',
			'conditions' => array('Comment.class'=>'Post'),
		),
	);
}
```

`models/event.php`

```php
<?php
class Event extends AppModel {
	var $name = 'Event';
	var $hasMany = array(
		'Comment' => array(
			'className' => 'Comment',
			'foreignKey' => 'foreign_id',
			'conditions' => array('Comment.class'=>'Event'),
		),
	);
}
```

## The View

`views/posts/view.ctp`

```php
<h2><?php __('Post Details');?></h2>
<?php debug($post); ?>

<?php echo $form->create('Comment',array('url'=>array('controller'=>'posts','action'=>'view',$post['Post']['id'])));?>
	<fieldset>
		<legend><?php __('Add Comment');?></legend>
	<?php
		echo $form->input('Comment.name');
		echo $form->input('Comment.body');
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
```


## The Controller

Now to save the data.

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

		// save the comment
		if (!empty($this->data['Comment'])) {
			$this->data['Comment']['class'] = 'Post'; 
			$this->data['Comment']['foreign_id'] = $id; 
			$this->Post->Comment->create(); 
			if ($this->Post->Comment->save($this->data)) {
				$this->Session->setFlash(__('The Comment has been saved.', true),'success');
				$this->redirect(array('action'=>'view',$id));
			}
			$this->Session->setFlash(__('The Comment could not be saved. Please, try again.', true),'warning');
		}

		// set the view variables
		$post = $this->Post->read(null, $id); // contains $post['Comments']
		$this->set(compact('post'));
	}
}
```

## In Conclusion

That's all there is to it, now you can save comments related to any other model record!
