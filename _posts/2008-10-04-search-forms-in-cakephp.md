---
layout: post
title: Search Forms in CakePHP
tags: [cakephp]
---
<p>In this CakePHP tutorial I would like to show you how I handle search forms, while preserving pagination.</p>

<p>The basic principal is to read the posted variables, and redirect the user to a page with the appropriate filters in the URL.</p>

<!--break-->

<h2>Add the Search Form</h2>

Lets add a search form on the index page to search through the records.

<b>index.ctp</b>
<pre class="brush:php">
&lt;?php echo $form->create('Post',array('action'=>'search'));?>
	&lt;fieldset>
 		&lt;legend>&lt;?php __('Post Search');?>&lt;/legend>
	&lt;?php
		echo $form->input('Search.keywords');
		echo $form->input('Search.id');
		echo $form->input('Search.name',array('after'=>__('wildcard is *',true)));
		echo $form->input('Search.body',array('after'=>__('wildcard is *',true)));
		echo $form->input('Search.active',array(
			'empty'=>__('Any',true),
			'options'=>array(
				0=>__('Inactive',true),
				1=>__('Active',true),
			),
		));
		echo $form->input('Search.created', array('after'=>'eg: >= 2 weeks ago'));
		echo $form->input('Search.category_id');
		echo $form->input('Search.tag');
		echo $form->input('Search.tag_id');
		echo $form->submit('Search');
	?>
	&lt;/fieldset>
&lt;?php echo $form->end();?>
</pre>


<h2>Controller Method</h2>

The search action will handle reading the posted variables, and redirecting back to the index url.

The index action will handle setting up the pagination options.

<b>controllers/posts_controller.php</b>
<pre class="brush:php">
&lt;?php
class PostsController extends AppController {
	var $name = 'Posts';

	function search() {
		// the page we will redirect to
		$url['action'] = 'index';
		
		// build a URL will all the search elements in it
		// the resulting URL will be 
		// example.com/cake/posts/index/Search.keywords:mykeyword/Search.tag_id:3
		foreach ($this->data as $k=>$v){ 
			foreach ($v as $kk=>$vv){ 
				$url[$k.'.'.$kk]=$vv; 
			} 
		}

		// redirect the user to the url
		$this->redirect($url, null, true);
	}
	function index() {
		// the elements from the url we set above are read  
		// automagically by cake into $this->passedArgs[]
		// eg:
		// $passedArgs['Search.keywords'] = mykeyword
		// $passedArgs['Search.tag_id'] = 3

		// required if you are using Containable
		// requires Post to have the Containable behaviour
		//$contain = array();  

		// we want to set a title containing all of the 
		// search criteria used (not required)		
		$title = array();
		
		//
		// filter by id
		//
		if(isset($this->passedArgs['id'])) {

			// set the conditions
			$this->paginate['conditions'][]['Post.id'] = $this->passedArgs['id'];

			// set the Search data, so the form remembers the option
			$this->data['Search']['id'] = $this->passedArgs['id'];

			// set the Page Title (not required)
			$title[] = __('ID',true).': '.$this->passedArgs['id'];
		}

		//
		// filter by keywords
		//
		if(isset($this->passedArgs['Search.keywords'])) {
			$keywords = $this->passedArgs['Search.keywords'];
			$this->paginate['conditions'][] = array(
				'OR' => array(
					'Post.name LIKE' => "%$keywords%",
					'Post.body LIKE' => "%$keywords%",
				)
			);
			$this->data['Search']['keywords'] = $keywords;
			$title[] = __('Keywords',true).': '.$keywords;
		}

		//
		// filter by name
		//
		if(isset($this->passedArgs['Search.name'])) {
			$this->paginate['conditions'][]['Post.name LIKE'] = str_replace('*','%',$this->passedArgs['Search.name']);
			$this->data['Search']['name'] = $this->passedArgs['Search.name'];
			$title[] = __('Name',true).': '.$this->passedArgs['Search.name'];
		}

		//
		// filter by body
		//
		if(isset($this->passedArgs['Search.body'])) {
			$this->paginate['conditions'][]['Post.body LIKE'] = str_replace('*','%',$this->passedArgs['Search.body']);
			$this->data['Search']['body'] = $this->passedArgs['Search.body'];
			$title[] = __('Body',true).': '.$this->passedArgs['Search.body'];
		}

		//
		// filter by active
		//
		if(isset($this->passedArgs['Search.active'])) {
			$this->paginate['conditions'][]['Post.active'] = ($this->passedArgs['Search.active'])?1:0; 
			$this->data['Search']['active'] = $this->passedArgs['Search.active'];
			$title[] = ($this->passedArgs['Search.active']) ? __('Active Posts',true) : __('Inactive Posts',true);
		}
		
		//
		// filter by created
		// allowing searches starting with &lt;, >, &lt;=, >=
		// allow human dates "2 weeks ago", "last thursday"
		//
		if(isset($this->passedArgs['Search.created'])) {
			$field = '';
			$date = explode(' ',$this->passedArgs['Search.created']);
			if (isset($date[1]) && in_array($date[0],array('&lt;','>','&lt;=','>='))) { 
				$field = ' '.array_shift($date);
			}
			$date = implode(' ',$date);
			$date = date('Y-m-d',strtotime($date));  
			$this->paginate['conditions'][]['Post.created'.$field] = $date;
			$this->data['Search']['created'] = $this->passedArgs['Search.created'];
			$title[] = 'Created: '.$this->passedArgs['Search.created'];
		}

		//
		// filter by category_id, including all children
		//
		if (isset($this->passedArgs['Search.category_id'])) {

			// get all children
			$category_ids = array($this->passedArgs['Search.category_id']);
			$children = $this->Post->Category->children($this->passedArgs['Search.category_id']);
			foreach ($children as $child) {
				$category_ids[] = $child['Category']['id'];
			}

			// set the conditions - SELECT ... WHERE field IN(1,2,3)
			$this->paginate['conditions'][]['Post.category_id'] = $category_ids;

			// set the Search data, so the form remembers the option
			$this->data['Search']['category_id'] = $this->passedArgs['Search.category_id'];

			// set the Page Title to the Category Name
			$title[] = __('Category',true).': '.$this->Post->Category->field('name',array('Category.id'=>$this->passedArgs['Search.category_id']));
		}
		
		//
		// filter by tag (habtm) - name or id
		//
		if (isset($this->passedArgs['Search.tag']) || isset($this->passedArgs['Search.tag_id'])) {

			// if we were given the tag name, get the id
			if (isset($this->passedArgs['Search.tag'])) {
				$this->passedArgs['Search.tag_id'] = $this->Post->Tag->field('id',array('Tag.name'=>$this->passedArgs['Search.tag']));
			}

			// bind the model as a hasOne so we can use the rows as conditions
			$this->Post->bindModel(array(
				'hasOne' => array(
					'PostTag' => array(
						'className' => 'PostTag',
						'foreignKey' => 'post_id',
						'conditions' => array(
							'PostTag.tag_id' => $this->passedArgs['Search.tag_id'],
						),
					),
				),
			),false);
			//$contain[] = 'PostTag'; // required if you are using Containable 
			
			// set the conditions
			$this->paginate['conditions'][]['PostTag.tag_id'] = $this->passedArgs['Search.tag_id'];

			// set the Search data, so the form remembers the option
			$this->data['Search']['tag_id'] = $this->passedArgs['Search.tag_id'];

			// set the Page Title to the Tag Name
			$title[] = __('Tag',true).': '.$this->Post->Tag->field('name',array('Tag.id'=>$this->passedArgs['Search.tag_id']));
		}

		// get posts		
		//$this->Post->contain($contain); // required if you are using Containable
		//$this->paginate['reset']=false; // required if you are using Containable
		$posts = $this->paginate();
		
		// set the category path of each post (not required, just an example)
		// requires Category to have the Tree behaviour
		//
		// you can use this to add anything you want to the $posts array
		// before it is sent to the view
		foreach($posts as $k=>$post) {
			$posts[$k]['CategoryPath'] = $this->Post->Category->getPath($post['Post']['category_id']);
			$posts[$k]['CategoryPath'] = $posts[$k]['CategoryPath']?$posts[$k]['CategoryPath']:array(); 
		}

		// set title
		$title = implode(' | ',$title);
		$title = (isset($title)&&$title)?$title:__('All Posts',true);
		
		// set related data
		$tags = $this->Post->Tag->find('list');
		$this->set(compact('posts','tags','title'));
	}

}
</pre>


<h2>Getting Pagination to Remember Search Options</h2>

<p>A quick trick to get pagination to remember the search options.</p>

<b>views/posts/index.php</b>
<pre class="brush:php">
&lt;?php $paginator->options(array('url' => $this->passedArgs)); ?>
</pre>


<h2>Hiding the Search Form</h2>

<p>Here is some JavaScript that will allow you to hide the search form when it's not needed.</p>

<p>This Javascript requires <a href="http://jquery.com/">jQuery</a>.</p>

<b>views/posts/index.php</b>
<pre class="brush:php">
&lt;?php echo $html->link(__('Search', true), 'javascript:void(0)', array('class'=>'search-toggle')); ?>
</pre>

<pre class="brush:jscript">
$(document).ready(function(){
	// toggle the search form
	$('.search-toggle').click(function(){
		$('#PostSearchForm').toggle();
	});
	$('#PostSearchForm').hide();
});
</pre>


<h2>The Final Product</h2>

<p>Here is an example of how the form will look.</p>

[inline:search-forms-in-cakephp.jpg]
