---
layout: post
title: Multiple Flash Messages with Style in CakePHP
tags: [cakephp]
---
In this CakePHP tutorial I will explain how to output multiple flash messages.

This forms a message stack that can be used to inform the user that multiple events have taken place.

<!--break-->

## The Multi-Flash Function

We want to add a method to your app_controller to handle the message stack. Vary it to suit your needs

`app_controller.php`

```php
<?php
class AppController extends Controller {
	function _flash($message,$type='message') {
		$messages = (array)$this->Session->read('Message.multiFlash');
		$messages[] = array(
			'message'=>$message, 
			'layout'=>'default', 
			'element'=>'default',
			'params'=>array('class'=>$type),
		);
		$this->Session->write('Message.multiFlash', $messages);
	}
}
```

## Controller Method

This is just a test action to view your messages.

`controllers/posts_controller.php`

```php
<?php
class PostsController extends AppController {
	var $name = 'Posts';
	function admin_index() {
		$this->_flash(__('Normal message.', true),'message');
		$this->_flash(__('Info message.', true),'info');
		$this->_flash(__('Success message.', true),'success');
		$this->_flash(__('Warning message.', true),'warning');
		$this->_flash(__('Error message.', true),'error');
		$this->set('posts',$this->paginate());
	}
}
```

## Display The Messages

We want to display a message to the user for message we set.

`views/layouts/default.php`

```php
<div id="messages">
<?php
	if ($session->check('Message.flash')) $session->flash(); // the standard messages
	// multiple messages
	if ($messages = $session->read('Message.multiFlash')) {
		foreach($messages as $k=>$v) $session->flash('multiFlash.'.$k);
	}
?>
</div>
```

## Some CSS to Make it Pretty

This will set some colours and images.

```css
.message, .info, .success, .warning, .error {
	border: 1px solid;
	margin: 10px 0px;
	padding:15px 10px 15px 65px;
	background-repeat: no-repeat;
	background-position: 10px center;
	font-size: 125%;
}
.info {
	/* color: #00529B; */
	border-color: #00529B;
	background-color: #BDE5F8;
	background-image: url('../../img/message/info.png');
}
.success {
	/* color: #4F8A10; */
	border-color: #4F8A10;
	background-color: #DFF2BF;
	background-image:url('../../img/message/success.png');
}
.warning {
	/* color: #9F6000; */
	border-color: #9F6000;
	background-color: #FFFABF;
	background-image: url('../../img/message/warning.png');
}
.error {
	/* color: #D8000C; */
	border-color: #D8000C;
	background-color: #FFBABA;
	background-image: url('../../img/message/error.png');
}
```

## The Final Product

Here is how your messages will look.

[inline:multiple-flash-messages-with-style.jpg]
