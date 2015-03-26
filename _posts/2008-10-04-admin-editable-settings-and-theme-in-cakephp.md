---
layout: post
title: Admin Editable Settings and Theme in CakePHP
tags: [cakephp]
---

Usually the client will request for me to give them a way to edit simple settings in their application.
I decided to read all the variables from the database in the beforeFilter to make them available in any controller.

<!--break-->

## The Tables

`settings`

```sql
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
```

## The Models

Before we get started, lets setup the models.

`models/setting.php`

```php
<?php
class Setting extends AppModel {
	var $name = 'Setting';
}
```

## The Controller

The app_controller will do the work of setting the Settings and the Theme.

`app_controller.php`

```php
<?php
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
```

The settings controller handles the administration of the settings.

`controllers/settings_controller.php`

```php
<?php
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
```

## The Views

`views/settings/admin_index.ctp`

```php
<div class="actions">
	<ul>
		<li><?php echo $html->link(__('New Setting', true), array('action'=>'add')); ?></li>
	</ul>
</div>

<div class="settings index">

	<h2><?php __('Settings');?></h2>
	
	<?php echo $form->create('Setting',array('id'=>'SettingListForm','url'=>array('controller'=>'settings','action'=>'multi')));?>
	<table cellpadding="0" cellspacing="0" class="listTable">
		<tr>
			<th><span class="select_all">a</span>|<span class="select_none">n</span></th>
			<th><?php echo $paginator->sort('id');?></th>
			<th><?php echo $paginator->sort('name');?></th>
			<th><?php echo $paginator->sort('category');?></th>
			<th><?php echo $paginator->sort('setting');?></th>
			<th><?php echo $paginator->sort('value');?></th>
			<th><?php echo $paginator->sort('modified');?></th>
			<th class="actions"><?php __('Actions');?></th>
		</tr>
		<?php
		$i = 0;
		foreach ($settings as $setting):
			$class = null;
			if ($i++ % 2 == 0) {
				$class = ' class="altrow"';
			}
		?>
			<tr<?php echo $class;?>>
				<td>
					<?php echo $form->input($setting['Setting']['id'],array(
						'type'=>'checkbox',
						'label'=>false,
						'name'=>'record['.$setting['Setting']['id'].']',
						'id'=>'listRecord_'.$setting['Setting']['id'],
					)); ?>
				</td>
				<td>
					<?php echo $setting['Setting']['id']; ?>
				</td>
				<td>
					<?php echo $setting['Setting']['name']; ?>
				</td>
				<td>
					<?php echo $setting['Setting']['category']; ?>
				</td>
				<td>
					<?php echo $setting['Setting']['setting']; ?>
				</td>
				<td>
					<?php echo $setting['Setting']['value']; ?>
				</td>
				<td>
					<?php echo $setting['Setting']['modified']; ?>
				</td>
				<td class="actions">
					<?php echo $html->link(__('Edit', true), array('action'=>'edit', $setting['Setting']['id'])); ?>
				</td>
			</tr>
		<?php endforeach; ?>
	</table>
	
	<?php echo $form->end();?>
	<?php echo $this->renderElement('paging');?>
	
</div>
```


`views/settings/admin_form.ctp`

```php
<div class="actions">
	<ul>
		<li><?php echo $html->link(__('List Settings', true), array('action'=>'index'));?></li>
	</ul>
</div>

<div class="settings form">
	<h2><?php __('Edit Setting');?></h2>
	<?php echo $form->create('Setting');?>
		<fieldset>
	 		<legend><?php __('Setting Details');?></legend>
		<?php
			echo $form->input('id');
			echo $form->input('name');
			echo $form->input('description');
			echo $form->input('category');
			echo $form->input('setting');
			echo $form->input('value');
		?>
		</fieldset>
	<?php echo $form->end('Submit');?>
</div>
```
