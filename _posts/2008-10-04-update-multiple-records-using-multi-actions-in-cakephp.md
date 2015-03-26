---
layout: post
title: Update Multiple Records using Multi-Actions in CakePHP
tags: [cakephp]
---
<p>In this CakePHP tutorial I will explain how to update multiple records in a single action.</p>

<p>This will typically be used as an extension to the index views in your application, allowing a user to select which rows they would like to update, and then performing an action.</p>

<!--break-->

<h2>The Multi-Action Function</h2>

<p>The first thing we need to do is add a function to your controller to handle all of the multi-actions we will be creating. It will check to see if a multi-action is allowed, and will call that action.</p>

<p>I have also included a function called multiFlash to handle multiple messages to display back to the user after a redirect.</p>

<p>I prefer to use app_controller.php because then I do not need to put the code into every controller.</p>

<b>app_controller.php</b>
<pre class="brush:php">
&lt;?php
class AppController extends Controller {
	var $multiActions = array();

	function multi() {
		if (!isset($this->data['action']) || !count($this->data['action'])) {
			$this->_flash(__('Action was not defined in request.', true),'error');
			$this->redirect($this->referer(), null, true);
		}
		foreach ($this->data['action'] as $action=>$v){}
		if (!in_array($action,(array)$this->multiActions)) {
			$this->_flash(__(sprintf('Action %s is not allowed.',$action), true),'error');
			$this->redirect($this->referer(), null, true);
		}
		if (!method_exists($this,$action)) {
			$this->_flash(__(sprintf('Action %s is invalid.',$action), true),'error');
			$this->redirect($this->referer(), null, true);
		}
		$this->$action();
	}

	function admin_multi() {
		$this->multi();
	}

	function _flash($message,$type='message') {
		$messages = (array)$this->Session->read('Message.multiFlash');
		$messages[] = array('message'=>$message, 'layout'=>'default', 'params'=>array('class'=>$type));
		$this->Session->write('Message.multiFlash', $messages);
	}

?>
</pre>



<h2>The Multi-Delete Function</h2>

<p>This action will handle deleting all of the records that are selected.</p>

<p>This code goes inside your controller to handle the deleting of the selected records.</p>

<p>There is also an action included to list the data.</p>

<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
class PostsController extends AppController {
	var $name = 'Posts';
	var $multiActions = array('admin_multi_delete');
	function admin_index() {
		$this->set('posts',$this->paginate());
	}
	function admin_multi_delete() {
		if (!isset($this->params['form']['record']) || !count($this->params['form']['record'])) {
			$this->_flash(__('No records selected.', true),'warning');
			$this->redirect($this->referer(), null, true);
		}
		$ids = array();
		foreach ($this->params['form']['record'] as $id=>$v) {
			if ($v == 1) {
				if ($this->Post->del($id)) {
					$this->_flash(__(sprintf('Deleted record %d.',$id),true),'success');
				}
				else {
					$this->_flash(__(sprintf('Could not delete record %d.',$id),true),'error');
				}
			}
		}
		$this->redirect($this->referer(), null, true);
	}
}
?>
</pre>

<h2>Display The Messages</h2>

<p>We want to display a message to the user for each row we handled.</p>

<b>views/layouts/default.php</b>
<pre class="brush:php; html-script:true">
&lt;div id="messages">
&lt;?php
	if ($session->check('Message.flash')) $session->flash();
	if ($messages = $session->read('Message.multiFlash')) {
		foreach($messages as $k=>$v) $session->flash('multiFlash.'.$k);
	}
?>
&lt;/div>
</pre>



<h2>Display The Records</h2>

</p>In our index view we want to provide a checkbox for each row, and a submit button so the user can choose which action they would like to take.</p>

<b>views/posts/index.ctp</b>
<pre class="brush:php; html-script:true">
&lt;?php echo $form->create('Post',array('id'=>'PostListForm','url'=>array('controller'=>'posts','action'=>'multi')));?>
&lt;table cellpadding="0" cellspacing="0" class="listTable">
	&lt;tr>
		&lt;th>&lt;span class="select_all">a&lt;/span>|&lt;span class="select_none">n&lt;/span>&lt;/th>
		&lt;th>&lt;?php echo $paginator->sort(__('ID',true),'id');?>&lt;/th>
		&lt;th>&lt;?php echo $paginator->sort(__('Name',true),'name');?>&lt;/th>
		&lt;th class="actions">&lt;?php __('Actions');?>&lt;/th>
	&lt;/tr>
	&lt;?php
	$i = 0;
	foreach ($posts as $post):
		$class = ($i&1)?' class="altrow"':'';
	?>
		&lt;tr&lt;?php echo $class;?>>
			&lt;td>
				&lt;?php echo $form->input($post['Post']['id'],array(
					'type'=>'checkbox',
					'label'=>false,
					'name'=>'record['.$post['Post']['id'].']',
					'id'=>'listRecord_'.$post['Post']['id'],
				)); ?>
			&lt;/td>
			&lt;td>
				&lt;?php echo $post['Post']['id']; ?>
			&lt;/td>
			&lt;td>
				&lt;?php echo $post['Post']['name']; ?>
			&lt;/td>
			&lt;td class="actions">
				&lt;?php echo $html->link(__('View', true), array('action'=>'view', $post['Post']['id'])); ?>
				&lt;?php echo $html->link(__('Edit', true), array('action'=>'edit', $post['Post']['id'])); ?>
				&lt;?php echo $html->link(__('Delete', true), array('action'=>'delete', $post['Post']['id']), null, sprintf(__('Are you sure you want to delete # %s?', true), $post['Post']['id'])); ?>
			&lt;/td>
		&lt;/tr>
	&lt;?php endforeach; ?>
&lt;/table>
&lt;div class="multi_actions">
	&lt;input type="submit" name="data[action][admin_multi_delete]" value="Delete" onclick="return confirm('&lt;?php __('Are you sure you want to delete the selected records?'); ?>');"/>
&lt;/div>

&lt;?php echo $form->end();?>
&lt;?php echo $this->element('paging');?>
</pre>



<h2>A Touch of JavaScript</h2>

<p>Some JavaScript to hilight a hover and auto-select the checkboxes when the row is clicked.</p>

<p>This requires <a href="http://jquery.com/">jQuery</a>.</p>

<pre class="brush:jscript">
$(document).ready(function() {

    // tr hover
	$('.listTable tr').hover(function(){
   		if (!$(this).is('.disabled')) {
			$(this).addClass('hover');
		}
	},function(){
		$(this).removeClass('hover');
	});

	// tr click
	$('.listTable td').click(function(){
   		if (!$(this).parents('tr').is('.disabled') && !$(this).is('.disabled') && !$(this).is('.actions')) {
			toggleTableRow($(this).parents('tr'));
		}
	});

	// select none
	$('.select_none').click(function(){
		$('.listTable tr').each(function(){
			toggleTableRow(this,'off');
		});
	});

	// select all
	$('.select_all').click(function(){
		$('.listTable tr').each(function(){
			toggleTableRow(this,'on');
		});
	});

	// init, all off
	$('.listTable tr').each(function(){
		toggleTableRow(this,'off');
	});

	// function to tolle a tr on/off
	function toggleTableRow(e,toggle){
		if (toggle=='off') {
			$(e).find('input').attr('checked',false);
			$(e).removeClass('selected');
		}
		else if (toggle=='on') {
			$(e).find('input').attr('checked',true);
			$(e).addClass('selected');
		}
		else if ($(e).is('.selected')) {
			$(e).find('input').attr('checked',false);
			$(e).removeClass('selected');
		}
		else {
			$(e).find('input').attr('checked',true);
			$(e).addClass('selected');
		}
	}

});
</pre>



<h2>Tidy it up with some CSS</h2>

<p>This will give the hover and selected rows a highlight colour.</p>

<pre class="brush:css">
.listTable tr.hover td {
	background:#FBFFDF;
}
.listTable tr.selected td {
	background:#FFFABF;
}
.select_all,
.select_none {
	cursor: pointer;
}
.multi_actions {
	font-size: 70%;
	border: 1px solid #C1DAD7;
	border-top: 0;
	margin: 0;
}
.multi_actions_text {
	font-size: 130%;
}
</pre>



<h2>The Final Product</h2>

<p>Here is some screenshots from an application using the multi-delete function.</p>

[inline:updating-multiple-records-cakephp-using-multi-actions_1.jpg] [inline:updating-multiple-records-cakephp-using-multi-actions_2.jpg] [inline:updating-multiple-records-cakephp-using-multi-actions_3.jpg]
