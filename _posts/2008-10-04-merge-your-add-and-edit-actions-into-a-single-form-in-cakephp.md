---
layout: post
title: Merge your Add and Edit actions into a Single Form in CakePHP
created: 1223134945
---
<p>This CakePHP example will show you how to merge your Add and Edit forms into a Single Form action.</p>
<p>This may be of benefit if you have a form with complex controller logic that you don't want to duplicate.</p>
<!--break-->

<h2>The Controller</h2>
<p>We redirect the add and edit actions to use the form action.</p>
<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
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
?>
</pre>

<h2>The View</h2>
<p>The view can be copied from your current edit template.</p>
<b>views/posts/form.ctp</b>
<pre class="brush:php; html-script:true">
&lt;?php echo $form->create('Post');?>
	&lt;fieldset>
 		&lt;legend>&lt;?php __('Post Details');?>&lt;/legend>
		&lt;?php
		echo $form->input('id');
		echo $form->input('name');
		echo $form->input('body');
		echo $form->input('active',array('type'=>'checkbox'));
		?>
	&lt;/fieldset>
&lt;?php echo $form->end('Submit');?>
</pre>
