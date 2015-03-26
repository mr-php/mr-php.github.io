---
layout: post
title: Working with HABTM Form Data in CakePHP
tags: [cakephp]
---
I would like to document several speedy ways I have of working with HABTM data.

<!--break-->

* <a href="/code/working-habtm-form-data-cakephp#tables">The Tables</a>
* <a href="/code/working-habtm-form-data-cakephp#models">The Models</a>
* <a href="/code/working-habtm-form-data-cakephp#habtm_select">HABTM Select</a>
* <a href="/code/working-habtm-form-data-cakephp#habtm_checkbox">HABTM Checkbox</a>
* <a href="/code/working-habtm-form-data-cakephp#habtm_text_add">HABTM Text Add</a>
* <a href="/code/working-habtm-form-data-cakephp#habtm_textarea_edit">HABTM TextArea Edit</a>
* <a href="/code/working-habtm-form-data-cakephp#conclusion">Conclusion</a>


<h2><a name="tables" id="tables"></a>The Tables</h2>

```sql
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
```

<h2><a name="models" id="tables2"></a>The Models</h2>

Before we get started, lets setup the models.

`models/post.php`

```php
<?php
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
```

`models/tag.php`

```php
<?php
class Tag extends AppModel {
	var $name = 'Tag';
}
```


<h2><a name="habtm_select" id="habtm_select"></a>HABTM Select</h2>

This is the default CakePHP way of handling HABTM forms.

It will allow you to add or remove HABTM data using a multiple select box (by holding CTRL).

[inline:habtm-select.jpg]

`views/posts/form.ctp`

```php
<?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	<fieldset>
		<legend><?php __('Post Details');?></legend>
		<?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		echo $form->input('Tag.Tag');
		?>
	</fieldset>
<?php echo $form->end('Submit');?>
```

`controllers/posts_controller.php`

```php
<?php 
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
```

<h2><a name="habtm_checkbox" id="habtm_checkbox"></a>HABTM Checkbox</h2>

If you have too many options to list in a select box, or if the labels in the select options do not suit your needs then you may want to try HABTM Checkbox.

It will allow you to add or remove HABTM data using a checkbox for each HABTM item.

[inline:habtm-checkbox.jpg]

`views/posts/form.ctp`

```php
<?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	<fieldset>
		<legend><?php __('Post Details');?></legend>
		<?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		?>
	</fieldset>
	<fieldset>
		<legend><?php __('Tags');?></legend>
		<?php

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
	</fieldset>
<?php echo $form->end('Submit');?>
```

`controllers/posts_controller.php`

```php
<?php
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
```

<h2><a name="habtm_text_add" id="habtm_text_add"></a>HABTM Text Add</h2>

If you want to allow users to enter tags that are added to the current tags.

It will allow you to add but not remove HABTM data using a text input with comma seperated values.

[inline:habtm-textadd.jpg]

`views/posts/form.ctp`

```php
<?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	<fieldset>
 		<legend><?php __('Post Details');?></legend>
	<?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
	?>
	</fieldset>
	<fieldset>
 		<legend><?php __('Tags');?></legend>
	<?php
		// display current tags
		$links = array();
		if ($post['Tag']) {
			foreach($post['Tag'] as $k=>$row) {
				$links[] = $row['name'];
			}
		}
		echo '<div>';
		echo __('Current tags',true).':<br/>';
		echo implode(', ',$links);
		echo '</div>';
	    echo $form->input('Tag.tags',array(
			'type' => 'text',
			'label' => __('Add Tags',true),
			'after' => __('Seperate each tag with a comma.  Eg: family, sports, icecream',true)
		));
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
```

`controllers/posts_controller.php`

```php
<?php
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
```


<h2><a name="habtm_textarea_edit" id="habtm_textarea_edit"></a>HABTM TextArea Edit</h2>

Finally, your admin may ask you if they can just edit all of the data as a comma separated list.

It will allow you to add and remove HABTM data using a textarea input with comma separated values.

[inline:habtm-textareaedit.jpg]

`views/posts/form.ctp`

```php
<?php echo $form->create('Post',array('url'=>array('action'=>'form')));?>
	<fieldset>
 		<legend><?php __('Post Details');?></legend>
		<?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		?>
	</fieldset>
	<fieldset>
 		<legend><?php __('Tags');?></legend>
	<?php
	    echo $form->input('Post.tags',array(
			'type' => 'textarea',
			'label' => __('Tags',true),
			'after' => __('Seperate each tag with a comma.  Eg: family, sports, icecream',true)
		));
	?>
	</fieldset>
<?php echo $form->end('Submit');?>
```

`controllers/posts_controller.php`

```php
<?php
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
```


<h2><a name="conclusion" id="conclusion"></a>Conclusion</h2>

There are many great ways to work with HABTM data, these are just a few examples of what can be done.  Enjoy your CakePHP.
