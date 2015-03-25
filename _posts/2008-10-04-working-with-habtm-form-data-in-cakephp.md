---
layout: post
title: Working with HABTM Form Data in CakePHP
created: 1223137444
---
I would like to document several speedy ways I have of working with HABTM data.
<!--break-->
<ul>
	<li><a href="/code/working-habtm-form-data-cakephp#tables">The Tables</a></li>
	<li><a href="/code/working-habtm-form-data-cakephp#models">The Models</a></li>
	<li><a href="/code/working-habtm-form-data-cakephp#habtm_select">HABTM Select</a></li>
	<li><a href="/code/working-habtm-form-data-cakephp#habtm_checkbox">HABTM Checkbox</a></li>
	<li><a href="/code/working-habtm-form-data-cakephp#habtm_text_add">HABTM Text Add</a></li>
	<li><a href="/code/working-habtm-form-data-cakephp#habtm_textarea_edit">HABTM TextArea Edit</a></li>
    <li><a href="/code/working-habtm-form-data-cakephp#conclusion">Conclusion</a></li>
</ul>


<h2><a name="tables" id="tables"></a>The Tables</h2>
<pre class="brush:sql">
CREATE TABLE `posts` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `body` text NOT NULL,
  PRIMARY KEY  (`id`)
);
CREATE TABLE `tags` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
);
CREATE TABLE `posts_to_tags` (
  `post_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY  (`post_id`,`tag_id`)
);
</pre>

<h2><a name="models" id="tables2"></a>The Models</h2>

Before we get started, lets setup the models.

<b>models/post.php</b>
<pre class="brush:php">
&lt;?php
class Post extends AppModel {
	var $name = 'Post';
	
	var $hasAndBelongsToMany = array(
		'Tag' => array(
			'className' => 'Tag',
			'joinTable' => 'posts_to_tags',
			'foreignKey' => 'post_id',
			'associationForeignKey' => 'tag_id',
			'with' => 'PostToTag',
		),
	);	
	
}
</pre>

<b>models/tag.php</b>
<pre class="brush:php">
&lt;?php
class Tag extends AppModel {
	var $name = 'Tag';
}
</pre>


<h2><a name="habtm_select" id="habtm_select"></a>HABTM Select</h2>

<p>This is the default CakePHP way of handling HABTM forms.</p>

<p>It will allow you to add or remove HABTM data using a multiple select box (by holding CTRL).</p>

[inline:habtm-select.jpg]
<b>views/posts/form.ctp</b>
<pre class="brush:php">
&lt;?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	&lt;fieldset>
		&lt;legend>&lt;?php __('Post Details');?>&lt;/legend>
		&lt;?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		echo $form->input('Tag.Tag');
		?>
	&lt;/fieldset>
&lt;?php echo $form->end('Submit');?>
</pre>

<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php 
class PostsController extends AppController {
	var $name = 'Posts';
	
	function form($id = null) {
		if (!empty($this->data)) {
			// form sends data as:
			// $this->data['Post']['Tag']['Tag'][1] = 1;
			// $this->data['Post']['Tag']['Tag'][3] = 3;
			
			// save the data (auto-handles habtm save)
			$this->Post->create();
			if ($this->Post->save($this->data)) {
				$this->Session->setFlash(__('The Post has been saved.',true));
				$this->redirect(array('action'=>'form',$this->Post->id));
			}
			else {
				$this->Session->setFlash(__('The Post could not be saved. Please, try again.'),true);
			}
		}
		if (empty($this->data)) {
			$this->data = $this->Post->read(null, $id);
		}
		$tags = $this->Post->Tag->find('list',array('fields'=>array('id','name')));
		$this->set(compact('tags'));
	}
}
</pre>

<h2><a name="habtm_checkbox" id="habtm_checkbox"></a>HABTM Checkbox</h2>

<p>If you have too many options to list in a select box, or if the labels in the select options do not suit your needs then you may want to try HABTM Checkbox.</p>

<p>It will allow you to add or remove HABTM data using a checkbox for each HABTM item.</p>

[inline:habtm-checkbox.jpg]
<b>views/posts/form.ctp</b>
<pre class="brush:php">
&lt;?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	&lt;fieldset>
		&lt;legend>&lt;?php __('Post Details');?>&lt;/legend>
		&lt;?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		?>
	&lt;/fieldset>
	&lt;fieldset>
		&lt;legend>&lt;?php __('Tags');?>&lt;/legend>
		&lt;?php

		// output all the checkboxes at once
		echo $form->input('Tag',array(
			'label' => __('Tags',true),
			'type' => 'select',
			'multiple' => 'checkbox',
			'options' => $tags,
			'selected' => $html->value('Tag.Tag'),
		)); 

		/*
		// output all the checkboxes individually
		$checked = $form->value('Tag.Tag');
		echo $form->label(__('Tags',true));
		foreach ($tags as $id=>$label) {
			echo $form->input("Tag.checkbox.$id", array(
				'label'=>$label,
				'type'=>'checkbox',
				'checked'=>(isset($checked[$id])?'checked':false),
			));
		}
		*/
		?>
	&lt;/fieldset>
&lt;?php echo $form->end('Submit');?>
</pre>
<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
class PostsController extends AppController {
	var $name = 'Posts';

	function form($id = null) {
		if (!empty($this->data)) {

			/*
			// get the tags from the single checkbox data
			$this->data['Tag']['Tag'] = array();
			foreach($this->data['Tag']['checkbox'] as $k=>$v) {
				if ($v) $this->data['Tag']['Tag'][] = $k;
			}
			*/
			
			// save the data
			$this->Post->create();
			if ($this->Post->save($this->data)) {
				$this->Session->setFlash(__('The Post has been saved.', true));
				$this->redirect(array('action'=>'form',$this->Post->id));
			}
			else {
				$this->Session->setFlash(__('The Post could not be saved. Please, try again.', true));
			}
		}
		if (empty($this->data)) {
			$this->data = $this->Post->read(null, $id);
		}
		$tags = $this->Post->Tag->find('list',array('fields'=>array('id','name')));
		$this->set(compact('tags'));
	}
}
</pre>

<h2><a name="habtm_text_add" id="habtm_text_add"></a>HABTM Text Add</h2>

<p>If you want to allow users to enter tags that are added to the current tags.</p>

<p>It will allow you to add but not remove HABTM data using a text input with comma seperated values.</p>

[inline:habtm-textadd.jpg]
<b>views/posts/form.ctp</b>
<pre class="brush:php">
&lt;?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	&lt;fieldset>
 		&lt;legend>&lt;?php __('Post Details');?>&lt;/legend>
	&lt;?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
	?>
	&lt;/fieldset>
	&lt;fieldset>
 		&lt;legend>&lt;?php __('Tags');?>&lt;/legend>
	&lt;?php
		// display current tags
		$links = array();
		if ($post['Tag']) {
			foreach($post['Tag'] as $k=>$row) {
				$links[] = $row['name'];
			}
		}
		echo '&lt;div>';
		echo __('Current tags',true).':&lt;br/>';
		echo implode(', ',$links);
		echo '&lt;/div>';
	    echo $form->input('Tag.tags',array(
			'type' => 'text',
			'label' => __('Add Tags',true),
			'after' => __('Seperate each tag with a comma.  Eg: family, sports, icecream',true)
		));
	?>
	&lt;/fieldset>
&lt;?php echo $form->end('Submit');?>
</pre>

<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
class PostsController extends AppController {
	var $name = 'Posts';

	function form($id = null) {
		if (!empty($this->data)) {

			// get the tags from the text data
			if ($this->data['Tag']['tags']) {
				$this->data['Post']['id'] = $id;
				$tags = explode(',',$this->data['Tag']['tags']);
				foreach($tags as $_tag) {
					$_tag = strtolower(trim($_tag));
					if ($_tag) {
						// check if the tag exists
						$this->Post->Tag->recursive = -1;
						$tag = $this->Post->Tag->findByName($_tag);
						if (!$tag) {
							// create new tag
							$this->Post->Tag->create();
							$tag = $this->Post->Tag->save(array('name'=>$_tag));
							$tag['Tag']['id'] = $this->Post->Tag->id;
							if (!$tag) {
								$this->Session->setFlash(__(sprintf('The Tag %s could not be saved.',$_tag), true));
							}
						}
						if ($tag) {
							// use current tag
							$this->data['Tag']['Tag'][$tag['Tag']['id']] = $tag['Tag']['id'];
						}
					}
				}
			}

			// prevent the current tags from being deleted
			$this->Post->hasAndBelongsToMany['Tag']['unique'] = false;
			
			// save the data
			$this->Post->create();
			if ($this->Post->save($this->data)) {
				$this->Session->setFlash(__('The Post has been saved.', true));
				$this->redirect(array('action'=>'form',$this->Post->id));
			}
			else {
				$this->Session->setFlash(__('The Post could not be saved. Please, try again.', true));
			}
		}
		if (empty($this->data)) {
			$this->data = $this->Post->read(null, $id);
		}
		
		// get the posts current tags
		$post = $id ? $this->Post->find(array('Post.id'=>$id)) : false;
		
		$this->set(compact('post'));
	}
}
</pre>


<h2><a name="habtm_textarea_edit" id="habtm_textarea_edit"></a>HABTM TextArea Edit</h2>

<p>Finally, your admin may ask you if they can just edit all of the data as a comma seperated list.</p>

<p>It will allow you to add and remove HABTM data using a textarea input with comma seperated values.</p>

[inline:habtm-textareaedit.jpg]
<b>views/posts/form.ctp</b>
<pre class="brush:php">
&lt;?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	&lt;fieldset>
 		&lt;legend>&lt;?php __('Post Details');?>&lt;/legend>
		&lt;?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		?>
	&lt;/fieldset>
	&lt;fieldset>
 		&lt;legend>&lt;?php __('Tags');?>&lt;/legend>
	&lt;?php
	    echo $form->input('Post.tags',array(
			'type' => 'textarea',
			'label' => __('Tags',true),
			'after' => __('Seperate each tag with a comma.  Eg: family, sports, icecream',true)
		));
	?>
	&lt;/fieldset>
&lt;?php echo $form->end('Submit');?>
</pre>
<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
class PostsController extends AppController {
	var $name = 'Posts';

	function form($id = null) {
		if (!empty($this->data)) {

			// get the tags from the textarea data
			$tags = explode(',',$this->data['Post']['tags']);
			foreach($tags as $_tag) {
				$_tag = strtolower(trim($_tag));
				if ($_tag) {
					$this->Post->Tag->recursive = -1;
					$tag = $this->Post->Tag->findByName($_tag);
					if (!$tag) {
						$this->Post->Tag->create();
						$tag = $this->Post->Tag->save(array('name'=>$_tag));
						$tag['Tag']['id'] = $this->Post->Tag->id;
						if (!$tag) {
							$this->_flash(__(sprintf('The Tag %s could not be saved.',$_tag), true),'success');
						}
					}
					if ($tag) {
						$this->data['Tag']['Tag'][$tag['Tag']['id']] = $tag['Tag']['id'];
					}
				}
			}

			// save the data
			$this->Post->create();
			if ($this->Post->save($this->data)) {
				$this->Session->setFlash(__('The Post has been saved.', true));
				$this->redirect(array('action'=>'form',$this->Post->id));
			}
			else {
				$this->Session->setFlash(__('The Post could not be saved. Please, try again.', true));
			}
		}
		if (empty($this->data)) {
			$this->data = $this->Post->read(null, $id);
			// load the habtm data for the textarea
			$tags = array();
			if (isset($this->data['Tag']) && !empty($this->data['Tag'])) {
				foreach($this->data['Tag'] as $tag) {
					$tags[] = $tag['name'];
				}
				$this->data['Post']['tags'] = implode(', ',$tags);
			}
		}
		
		// get the posts current tags
		$post = $id ? $this->Post->find(array('Post.id'=>$id)) : false;
		
		$this->set(compact('post'));
	}
}
</pre>


<h2><a name="conclusion" id="conclusion"></a>Conclusion</h2>

<p>There are many great ways to work with HABTM data, these are just a few examples of what can be done.  Enjoy your CakePHP.</p>
