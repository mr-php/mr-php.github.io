---
layout: post
title: Prevent Cron Task Overlap in CakePHP
excerpt: If you have a task that runs every 5 minutes, and it takes more than 5 minutes to run then the next task will start causing even more server load.  This effect may stack up and eventually cause your server to come to a grinding halt.  For this reason it is very important that your scheduled tasks do not overlap.
tags: [cakephp]
redirect_from:
- /blog/prevent-cron-task-overlap-cakephp/
- /code/prevent-cron-task-overlap-cakephp/
- /code/prevent-cron-task-overlap-in-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>. If you notice any changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

If you have a task that runs every 5 minutes, and it takes more than 5 minutes to run then the next task will start causing even more server load.  This effect may stack up and eventually cause your server to come to a grinding halt.  For this reason it is very important that your scheduled tasks do not overlap.

I have created a Component for CakePHP that will create a lock file containing a process ID.  If the task tries to run while another instance is already running the Component will cause the script to exit instead of attempting to run the task again.  This provides a safe way to run the scheduled tasks at very short intervals with no risk of overlaps.


## Prevent Cron Overlaps in your Controllers

Simply pass the actions that you want to lock when you declare the Component.  If the action is already running then the script will exit before executing any code in your action.

`app/controller/posts_controller.php`

```php
<?php
class PostsController extends AppController {
	var $name = 'Posts';
	var $components = array('Lock'=>array('cron'));

	function cron() {
		$this->autoRender = false;
		sleep(30);
		echo __('script is complete', true);
	}

}
```


## Prevent Cron Overlaps in your Shells

The preferred way to run your cron jobs is using CakePHP Shells.  You will however have to include the Component in your Shell class or Task class aswell as calling the lock() method before any other code executes.

`app/vendors/shells/my.php

```php
<?php 
App::import('Core', 'Controller');
App::import('Component', 'Lock');

class MyShell extends Shell {
	var $Controller;
	var $Lock;

	function process() {
		$this->Controller =& new Controller();
		$this->Lock =& new LockComponent();
		$this->Lock->lock('MyShell.process');
		sleep(30);
		$this->out(__('script is complete', true));
	}

}
```


## The Component

`app/controllers/components/lock.php`

```php
<?php
class LockComponent extends Object {
	var $actions;
	var $controller;

	function initialize(&$controller, $settings = array()) {
		$this->controller =& $controller;
		$this->actions = $settings;
	}

	function startup(&$controller) {
		if ($this->actions && in_array($this->controller->action,$this->actions)) {
			$this->lock($this->controller->name.'.'.$this->controller->action);
		}
	}

	function shutdown(&$controller) {
	   $this->unlock($this->controller->name.'.'.$this->controller->action);
	}

	function lock($key) {
		if (!is_dir(TMP.'lock')) mkdir(TMP.'lock');
		$lock_file = TMP.'lock'.DS.$key;
		if(file_exists($lock_file)) {
			if($this->running(file_get_contents($lock_file))) {
				echo __('action is already running', true);
				exit;
			}
		}
		file_put_contents($lock_file, getmypid());
		return true;
	}

	function unlock($key) {
		$lock_file = TMP.'lock'.DS.$key;
		if(file_exists($lock_file)) unlink($lock_file);
		return true;
	}

	function running($pid) {
		if (stristr(PHP_OS,'WIN')) {
			if (`tasklist /fo csv /fi "PID eq $pid"`) 
				return true;
		}
		else {
			if(in_array($pid, explode(PHP_EOL, `ps -e | awk '{print $1}'`))) 
				return true;
		}   
		return false;
	}

}
```
