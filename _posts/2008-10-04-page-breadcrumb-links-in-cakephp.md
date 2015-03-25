---
layout: post
title: Page Breadcrumb Links in CakePHP
created: 1223133442
---
<p>I wanted to make a quick and easy breadcrumb that worked with a simple array.</p>
<p>The breadcrumb is an array containing multiple links from html_helper::link().</p>
<!--break-->

<h2>The Models</h2>
<p>For this example we need to have a category with the Tree behaviour.</p>
<b>models/post.php</b>
<pre class="brush:php">
&lt;?php
class Post extends AppModel {
	var $name = 'Post';
	var $belongsTo = array(
		'Category' => array(
			'className' => 'Category',
			'foreignKey' => 'category_id',
		),
	);                
}
</pre>

<b>models/category.php</b>
<pre class="brush:php">
&lt;?php
class Category extends AppModel {
	var $name = 'Category';
	var $actsAs = array('Tree');
}
</pre>

<h2>The Controllers</h2>
<p>I will provide the controller action for posts::view(), however you can use this on any and every action.</p>
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
		
		// load the post
		$post = $this->Post->read(null, $id);

		// set the category path
		$post['CategoryPath'] = $this->Post->Category->getPath($post['Post']['category_id']); 
		$post['CategoryPath'] = $post['CategoryPath']?$post['CategoryPath']:array(); 

		// set page title
		$title = $post['Post']['name'];
		
		// set breadcrumb
		$breadcrumb = array();
		$breadcrumb[] = $html->link(__('Home',true),'/');
		$breadcrumb[] = $html->link(__('Posts',true),array('controller'=>'posts','action'=>'index'));
 		foreach ($post['CategoryPath'] as $category) {
			$breadcrumb[] = $html->link(__($category['Category']['name'],true),array(
				'controller'=>'posts',
				'action'=>'index',
				'category_id'=>$category['Category']['id']
			));
		}
		$breadcrumb[] = $title;

		// set page variables
		$this->set(compact('post','title','breadcrumb'));
	}
}
</pre>

<h2>The View</h2>
<p>The view is very simple.</p>
<b>views/layout/default.ctp</b>
<pre class="brush:php; html-script:true">
&lt;?php if (isset($breadcrumb)): ?>
	&lt;div id="breadcrumb">&lt;?php echo implode(' &raquo; ',$breadcrumb); ?>&lt;/div>
&lt;?php endif; ?>
</pre>
