---
layout: post
title: Multiple Flash Messages with Style in CakePHP
created: 1223123204
---
<p>In this CakePHP tutorial I will explain how to output multiple flash messages.</p>
<p>This forms a message stack that can be used to inform the user that multiple events have taken place.</p>
<!--break-->

<h2>The Multi-Flash Function</h2>
<p>We want to add a method to your app_controller to handle the message stack. Vary it to suit your needs</p>
<b>app_controller.php</b>
<pre class="brush:php">
&lt;?php
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
</pre>

<h2>Controller Method</h2>
<p>This is just a test action to view your messages.</p>
<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
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
</pre>

<h2>Display The Messages</h2>
<p>We want to display a message to the user for message we set.</p>
<b>views/layouts/default.php</b>
<pre class="brush:php; html-script:true">
&lt;div id="messages">
&lt;?php
	if ($session->check('Message.flash')) $session->flash(); // the standard messages
	// multiple messages
	if ($messages = $session->read('Message.multiFlash')) {
		foreach($messages as $k=>$v) $session->flash('multiFlash.'.$k);
	}
?>
&lt;/div>
</pre>

<h2>Some CSS to Make it Pretty</h2>
<p>This will set some colours and images.</p>
<pre class="brush:css">
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
</pre>

<h2>The Final Product</h2>
<p>Here is how your messages will look.</p>
[inline:multiple-flash-messages-with-style.jpg]
