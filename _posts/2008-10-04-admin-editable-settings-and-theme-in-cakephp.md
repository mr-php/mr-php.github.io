---
layout: post
title: Admin Editable Settings and Theme in CakePHP
created: 1223144647
---
<p>Usually the client will request for me to give them a way to edit simple settings in their application.</p>
<p>I decided to read all the variables from the database in the beforeFilter to make them available in any controller.</p>

<!--break-->

<h2>The Tables</h2>
<b>settings</b>
<pre class="brush:sql">
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(255) NOT NULL,
  `setting` varchar(255) NOT NULL,
  `value` text,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`)
);
INSERT INTO `settings` (`id`, `name`, `description`, `category`, `setting`, `value`, `created`, `modified`) VALUES
(1, 'Name', 'The title of the application.', 'app', 'name', 'Your Website', NOW(), NOW()),
(3, 'Theme', 'Front end theme.', 'app', 'theme', NULL, NOW(), NOW()),
(4, 'Admin Theme', 'Admin theme.', 'app', 'admin_theme', 'cp', NOW(), NOW()),
(5, 'Email', 'The default email address.', 'app', 'email', 'noreply@yourdomain.com', NOW(), NOW()),
(6, 'Delivery', 'Delivery method.  Valid options are: mail, smtp or debug.', 'smtp', 'delivery', 'debug', NOW(), NOW()),
(7, 'Username', 'SMTP Username.', 'smtp', 'username', NULL, NOW(), NOW()),
(8, 'Password', 'SMTP Password.', 'smtp', 'password', NULL, NOW(), NOW());
</pre>

<h2>The Models</h2>
<p>Before we get started, lets setup the models.</p>
<b>models/setting.php</b>
<pre class="brush:php">
&lt;?php
class Setting extends AppModel {
	var $name = 'Setting';
}
</pre>

<h2>The Controller</h2>
<p>The app_controller will do the work of setting the Settings and the Theme.</p>
<b>app_controller.php</b>
<pre class="brush:php">
&lt;?php
class AppController extends Controller {
	var $view = 'Theme'; // important for theming

	function beforeFilter() {
		$this->__setSettings();
		$this->__setTheme();
		parent::beforeFilter();
	}

	function __setSettings() {
		$Setting  = ClassRegistry::init('Setting');
  		$settings = $Setting->find('all');
  		foreach($settings as $_setting) {
  			if ($_setting['Setting']['value']!==null) {
	  			Configure::write('Settings.'.$_setting['Setting']['category'].'.'.$_setting['Setting']['setting'], $_setting['Setting']['value']);
  			}
  		}
  		// you can now use the following anywhere in your app
  		// $settings = Configure::read('Settings.app'); debug($settings)
	}

	function __setTheme() {
		// check if the admin is being requested
		if(isset($this->params[Configure::read('Routing.admin')])) {
			// set admin theme
			$this->theme = Configure::read('Settings.app.admin_theme');
		}
		else {
			// set front end theme
			$this->theme = Configure::read('Settings.app.theme');
		}
	}

}
</pre>

<p>The settings controller handles the administration of the settings.</p>
<b>controllers/settings_controller.php</b>
<pre class="brush:php">
&lt;?php
class SettingsController extends AppController{
	var $name = 'Settings';
	var $multiActions = array('admin_multi_delete');

	function admin_index() {
		if (isset($this->passedArgs['keywords']) && $this->passedArgs['keywords']) {
			$this->paginate['conditions'][]['Setting.name'] = 'LIKE %'.$this->passedArgs['keywords'].'%';
			$this->paginate['conditions'][]['Setting.category'] = 'LIKE %'.$this->passedArgs['keywords'].'%';
			$this->paginate['conditions'][]['Setting.setting'] = 'LIKE %'.$this->passedArgs['keywords'].'%';
			$this->data['Search']['keywords'] = $this->passedArgs['keywords'];
		}
		if (isset($this->passedArgs['category']) && $this->passedArgs['category']) {
			$this->paginate['conditions'][]['Setting.category'] = $this->passedArgs['category'];
			$this->data['Search']['category'] = $this->passedArgs['category'];
		}
		$settings = $this->paginate();
	 	$this->set('settings', $settings);
	}

	function admin_search() {
		$url['action'] = 'index';
		if (isset($this->data['Search']['keywords']) && $this->data['Search']['keywords'] && $this->data['Search']['keywords']!='keywords') {
			$url['keywords'] = $this->data['Search']['keywords'];
		}
		if (isset($this->data['Search']['category']) && $this->data['Search']['category'] && $this->data['Search']['keywords']!='category') {
			$url['category'] = $this->data['Search']['category'];
		}
		$this->redirect($url, null, true);
	}

	function admin_add() {
		$this->admin_form();
		$this->render('admin_form');
	}
	function admin_edit($id = null) {
		if (!$id && empty($this->data)) {
			$this->multiFlash(__('Invalid Setting.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
		$this->admin_form($id);
		$this->render('admin_form');
	}
	
	function admin_form($id = null) {
		if (!empty($this->data)) {
			// save the data			
			if ($this->Setting->save($this->data)) {
				$this->multiFlash(__('The Setting has been saved.', true),'success');
				$this->redirect(array('action'=>'view',$this->Setting->id));
			} else {
				$this->multiFlash(__('The Setting could not be saved. Please, try again.', true),'warning');
			}
		}
		if (empty($this->data)) {
			$this->data = $this->Setting->read(null, $id);
		}
	}
	
}
</pre>

<h2>The Views</h2>
<b>views/settings/admin_index.ctp</b>
<pre class="brush:php; html-script:true">
&lt;div class="actions">
	&lt;ul>
		&lt;li>&lt;?php echo $html->link(__('New Setting', true), array('action'=>'add')); ?>&lt;/li>
	&lt;/ul>
&lt;/div>

&lt;div class="settings index">

	&lt;h2>&lt;?php __('Settings');?>&lt;/h2>
	
	&lt;?php echo $form->create('Setting',array('id'=>'SettingListForm','url'=>array('controller'=>'settings','action'=>'multi')));?>
	&lt;table cellpadding="0" cellspacing="0" class="listTable">
		&lt;tr>
			&lt;th>&lt;span class="select_all">a&lt;/span>|&lt;span class="select_none">n&lt;/span>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('id');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('name');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('category');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('setting');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('value');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('modified');?>&lt;/th>
			&lt;th class="actions">&lt;?php __('Actions');?>&lt;/th>
		&lt;/tr>
		&lt;?php
		$i = 0;
		foreach ($settings as $setting):
			$class = null;
			if ($i++ % 2 == 0) {
				$class = ' class="altrow"';
			}
		?>
			&lt;tr&lt;?php echo $class;?>>
				&lt;td>
					&lt;?php echo $form->input($setting['Setting']['id'],array(
						'type'=>'checkbox',
						'label'=>false,
						'name'=>'record['.$setting['Setting']['id'].']',
						'id'=>'listRecord_'.$setting['Setting']['id'],
					)); ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $setting['Setting']['id']; ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $setting['Setting']['name']; ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $setting['Setting']['category']; ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $setting['Setting']['setting']; ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $setting['Setting']['value']; ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $setting['Setting']['modified']; ?>
				&lt;/td>
				&lt;td class="actions">
					&lt;?php echo $html->link(__('Edit', true), array('action'=>'edit', $setting['Setting']['id'])); ?>
				&lt;/td>
			&lt;/tr>
		&lt;?php endforeach; ?>
	&lt;/table>
	
	&lt;?php echo $form->end();?>
	&lt;?php echo $this->renderElement('paging');?>
	
&lt;/div>
</pre>


<b>views/settings/admin_form.ctp</b>
<pre class="brush:php; html-script:true">
&lt;div class="actions">
	&lt;ul>
		&lt;li>&lt;?php echo $html->link(__('List Settings', true), array('action'=>'index'));?>&lt;/li>
	&lt;/ul>
&lt;/div>

&lt;div class="settings form">
	&lt;h2>&lt;?php __('Edit Setting');?>&lt;/h2>
	&lt;?php echo $form->create('Setting');?>
		&lt;fieldset>
	 		&lt;legend>&lt;?php __('Setting Details');?>&lt;/legend>
		&lt;?php
			echo $form->input('id');
			echo $form->input('name');
			echo $form->input('description');
			echo $form->input('category');
			echo $form->input('setting');
			echo $form->input('value');
		?>
		&lt;/fieldset>
	&lt;?php echo $form->end('Submit');?>
&lt;/div>
</pre>
