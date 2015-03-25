---
layout: post
title: Attach Comments to Any Model in CakePHP
created: 1223139210
---
<p>This method of linking models allows you to have a single table of data, say Comment, that is related to any one of a number of other Models (eg: Post, Event).</p>
<!--break-->

<h2>The Tables</h2>
<pre class="brush:sql">
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
</pre>

<h2>The Models</h2>
<p>Before we get started, lets setup the models.</p>
<b>models/comment.php</b>
<pre class="brush:php">
&lt;?php
class Comment extends AppModel {
	var $name = 'Comment';
}
</pre>

<b>models/post.php</b>
<pre class="brush:php">
&lt;?php
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
</pre>

<b>models/event.php</b>
<pre class="brush:php">
&lt;?php
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
</pre>

<h2>The View</h2>
<b>views/posts/view.ctp</b>
<pre class="brush:php">
&lt;h2>&lt;?php __('Post Details');?>&lt;/h2>
&lt;?php debug($post); ?>

&lt;?php echo $form->create('Comment',array('url'=>array('controller'=>'posts','action'=>'view',$post['Post']['id'])));?>
	&lt;fieldset>
		&lt;legend>&lt;?php __('Add Comment');?>&lt;/legend>
	&lt;?php
		echo $form->input('Comment.name');
		echo $form->input('Comment.body');
	?>
	&lt;/fieldset>
&lt;?php echo $form->end('Submit');?>
</pre>


<h2>The Controller</h2>
<p>Now to save the data.</p>
<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
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
</pre>

<h2>In Conclusion</h2>
<p>That's all there is to it, now you can save comments related to any other model record!</p>
