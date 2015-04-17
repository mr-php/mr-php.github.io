---
layout: post
title: Merge your Add and Edit actions into a Single Form in CakePHP
excerpt: This CakePHP example will show you how to merge your Add and Edit forms into a Single Form action. This may be of benefit if you have a form with complex controller logic that you don't want to duplicate.
tags: [cakephp]
redirect_from:
- /blog/merge-your-add-and-edit-actions-single-form-cakephp/
- /code/merge-your-add-and-edit-actions-single-form-cakephp/
- /code/merge-your-add-and-edit-actions-into-a-single-form-in-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>.</p>
	<p>If you notice any other changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

This CakePHP example will show you how to merge your Add and Edit forms into a Single Form action.

This may be of benefit if you have a form with complex controller logic that you don't want to duplicate.


## The Controller

We redirect the add and edit actions to use the form action.

`controllers/posts_controller.php`

```php
<?php
class PostsController extends AppController {
	var $name = 'Posts';

	function add() {
		$this->admin_form();
		$this->render('form');
	}
	function edit($id = null) {
		if (!$id && empty($this->data)) {
			$this->_flash(__('Invalid Post.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
		$this->admin_form($id);
		$this->render('form');
	}
	
	function form($id = null) {
		if (!empty($this->data)) {
			$this->Post->create();
			if ($this->Post->save($this->data)) {
				$this->Session->setFlash(__('The Post has been saved.', true));
				$this->redirect(array('action'=>'view',$this->Video->id));
			}
			else {
				$this->Session->setFlash(__('The Post could not be saved. Please, try again.', true));
			}
		}
		if (empty($this->data)) {
			$this->data = $this->Post->read(null, $id);
		}
	}
}
```

## The View

The view can be copied from your current edit template.

`views/posts/form.ctp`

```php
<?php echo $form->create('Post');?>
	<fieldset>
 		<legend><?php __('Post Details');?></legend>
		<?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		echo $form->input('active',array('type'=>'checkbox'));
		?>
	</fieldset>
<?php echo $form->end('Submit');?>
```
