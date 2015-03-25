---
layout: post
title: Simple Auth with Users HABTM Groups in CakePHP
created: 1223143469
---
<p>In almost every project I need to setup some sort of login, and usually it requires group access to certain data depending on different criteria.</p>

<p>For example I may have groups Admin+Member and I want Members to only be able to see other Users Profiles if the other Profile is active.</p>

<!--break-->


<h2>Little Helper</h2>

<p>This function checks if the user is in a group.</p>

<b>config/bootstrap.php</b>
<pre class="brush:php">
&lt;?php
function in_group($group,$groups) {
	if (isset($groups['Group'])) {
		$groups = $groups['Group'];
	}
	if (!$groups || !is_array($groups) || empty($groups)) {
		return false;
	}
	$allow = false;
	foreach($groups as $_group) {
		if ($_group['name'] == $group) {
			$allow = true;
			break;
		}
	}
	return $allow;
}
?>
</pre>

<h2>The Tables</h2>

<pre class="brush:sql">
# users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL auto_increment,
  `username` char(50) NOT NULL,
  `password` char(50) NOT NULL,
  `active` tinyint(4) NOT NULL default '0',
  `email` varchar(255) NOT NULL,
  PRIMARY KEY  (`id`)
);
# groups
CREATE TABLE IF NOT EXISTS `groups` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(128) NOT NULL,
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`id`)
);
# groups_to_users
CREATE TABLE IF NOT EXISTS `groups_to_users` (
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY  (`group_id`,`user_id`)
);
</pre>


<h2>The Models</h2>

<p>Before we get started, lets setup the models.</p>

<p>I have added some validation to get you started.</p>

<b>app_model.php</b>
<pre class="brush:php">
&lt;?php
class AppModel extends Model {
	function validUnique($value,$field){
		if (is_array($field)) {
			foreach($field as $v) $field = $v;
		}
		$conditions = array();
		$conditions["{$this->name}.{$field}"] = $value;
		if (isset($this->id) && $this->id) {
			$conditions["{$this->name}.{$this->primaryKey}"] = "!={$this->id}";
		}
		$this->recursive = -1;
		return !$this->hasAny($conditions);
	}
    function required($field) {
    	foreach($field as $k=>$v){}
    	return $v?true:false;
	}
}
?>
{/syntaxhighlighter}
</pre>

<b>models/user.php</b>
<pre class="brush:php">
&lt;?php
class User extends AppModel {

    var $name = 'User';
    var $displayField = 'username';

    var $validate = array(
        'username' => array(
			'not unique' => array(
				'rule'=>array('validUnique','username'),
				'required' => true,
			),
            'must be alpha-numeric' => array(
				'rule' => 'alphaNumeric',
				'required' => true,
			),
			'required field' => array(
				'rule' => 'required',
				'required' => true,
			),
        ),
        'email' => array(
			'not unique' => array(
				'rule'=>array('validUnique','email'),
				'required' => true,
			),
            'invalid email' => array(
				'rule'=>'email',
				'required' => true,
			),
			'required field' => array(
				'rule' => 'required',
				'required' => true,
			),
        ),
        'password_confirm' => array(
            'does not match' => array(
				'rule' => 'validPasswordConfirm',
				'required' => false,
			),
        ),
    );
    
	var $hasAndBelongsToMany = array(
		'Group' => array(
			'className' => 'Group',
			'joinTable' => 'groups_to_users',
			'foreignKey' => 'user_id',
			'associationForeignKey' => 'group_id',
			'with' => 'GroupToUser',
		),
	);    

    function validPasswordConfirm($value){
        if ($this->data[$this->alias]['password_change'] != $this->data[$this->alias]['password_confirm']) {
            return false;
        }
        return true;
    }
}
</pre>

<b>models/group.php</b>
<pre class="brush:php">
&lt;?php
class Group extends AppModel {
	var $name = 'Group';
	var $validate = array(
		'name' => array(
			'required field' => array(
				'rule' => 'required',
				'required' => true,
			),
			'not unique' => array(
				'rule'=>array('validUnique','name'),
				'required' => true,
			),
		),
	);	
}
</pre>


<h2>The Controllers</h2>

<p>The app_controller will do the work of setting the related Groups into the Auth data.</p>

<b>app_controller.php</b>
<pre class="brush:php">
&lt;?php
class AppController extends Controller {
    var $components = array('Auth');

	function beforeFilter() {
        $this->__setAuthUser();

		// allow pages to be displayed to anyone
		if ($this->name=='Pages') {
	   		$this->Auth->allow('display');
		}

        parent::beforeFilter();
	}

	function __setAuthUser() {
		$this->Auth->userScope = array('User.active = 1');

		// read the auth info
		$auth = $this->Session->read('Auth');

		// set the auth users groups		
		if (!isset($auth['GroupUser']) || $auth['GroupUser']!=$auth['User']['id']) {
			$User = ClassRegistry::init('User');
			$auth = $User->find('first',array('conditions'=>array('User.id'=>$this->Auth->user('id'))));
			$auth['GroupUser'] = $this->Auth->user('id');
		}

		// check permissions for admin access		
		if(isset($this->params[Configure::read('Routing.admin')])) {
			if (isset($auth['User']['id']) && !in_group('admin',$auth)) {
				$this->_flash(__('You do not have permission to access the administration.',true),'error');
				$this->redirect(array('admin'=>false,'controller'=>'users','action'=>'login'));
			}
		}

		// save and set the auth info
		$this->Session->write('Auth',$auth);
		$this->set('auth',isset($auth['User'])?$auth:false);
	}

	function _flash($message,$type='message') {
		$messages = (array)$this->Session->read('Message.multiFlash');
		$messages[] = array('message'=>$message, 'layout'=>'default', 'params'=>array('class'=>$type));
		$this->Session->write('Message.multiFlash', $messages);
	}

}
</pre>

<p>Next I have provided a fully working users_controller, complete with account register, account management and lost password email.</p>

<p>I have also included some extra goodies such as habtm checkbox, breadcrumbs, search and multi-actions.</p>

<b>controllers/users_controller.php</b>
<pre class="brush:php">
&lt;?php
class UsersController extends AppController {
	var $name = 'Users';
	var $components = array('Email');
	
	var $multiActions = array(
		'multi_delete',
	);
	
	function beforeFilter() {
		parent::beforeFilter();
		$this->Auth->allow('register','password');
		if (isset($this->passedArgs['key'])) {
			$this->Auth->allow('account');
		}
	}
	
	//
	// PUBLIC ACTIONS
	//
	function index() {

		$title = 'My Account';

		// set breadcrumb
		$breadcrumb = array();
		$breadcrumb[] = array(
			'name' => 'Home',
			'href' => '/',
		);
		$breadcrumb[] = array(
			'name' => $title,
		);

		$this->set(compact('title','breadcrumb'));

	}
	
	function account() {
		// load account from key
		if (isset($this->passedArgs['key'])) {
			$this->recursive = -1;
			$user = $this->User->findByPassword($this->passedArgs['key']);
			if (!$user) {
				$this->_flash(__('Invalid Key.', true),'error');
				$this->redirect(array('action'=>'index'));
			}
			$this->Auth->login($user);
		}

		// load account from auth user
		$id = $this->Auth->user('id');
		if (!$id) {
			$this->_flash(__('Invalid User.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
		
		// process submit
		if (!empty($this->data)) {
			$error = false;
			$this->User->create();
			$this->User->id = $id;
			if ($this->data['User']['password_change']) {
				$this->data['User']['password'] = $this->Auth->password($this->data['User']['password_change']);
			}
			if ($this->User->save($this->data,true,array('email','username','password','password_change','password_confirm'))) {
				$this->_flash(__('Your Account has been saved.', true),'success');
				$this->redirect(array('action'=>'index'));
			}
			$this->_flash(__('Your Account could not be saved. Please, try again.', true),'warning');
		}
		if (empty($this->data)) {
			$this->data = $this->User->read(null, $id);
		}
		
		$title = 'Modify Details';

		// set breadcrumb
		$breadcrumb = array();
		$breadcrumb[] = array(
			'name' => 'Home',
			'href' => '/',
		);
		$breadcrumb[] = array(
			'name' => 'My Account',
			'href' => array('controller'=>'users','action'=>'index'),
		);
		$breadcrumb[] = array(
			'name' => $title,
		);

		$this->set(compact('title','breadcrumb'));
	}
	
	function register() {
		$title = 'Register';

		// process submit
		if (!empty($this->data)) {
			if (!$this->data['User']['password_confirm']) {
				$this->data['User']['password_confirm']=' ';
			}
			$this->data['User']['password'] = $this->Auth->password($this->data['User']['password_change']);
			$this->data['User']['active'] = 1;
			$this->User->create();
			if ($this->User->save($this->data,true,array('email','username','active','password','password_change','password_confirm'))) {
				$this->Auth->login($this->data);
				$this->_flash(__('Your Account has been created.', true),'success');
				$this->redirect(array('action'=>'index'));
			}
			$this->_flash(__('Your Account could not be created. Please, try again.', true),'warning');
		}

		// set breadcrumb
		$breadcrumb = array();
		$breadcrumb[] = array(
			'name' => 'Home',
			'href' => '/',
		);
		$breadcrumb[] = array(
			'name' => 'My Account',
			'href' => array('controller'=>'users','action'=>'index'),
		);
		$breadcrumb[] = array(
			'name' => $title,
		);

		$this->set(compact('title','breadcrumb'));
	}
	
	function login() {
		$title = 'Login';

		// set breadcrumb
		$breadcrumb = array();
		$breadcrumb[] = array(
			'name' => 'Home',
			'href' => '/',
		);
		$breadcrumb[] = array(
			'name' => 'My Account',
			'href' => array('controller'=>'users','action'=>'index'),
		);
		$breadcrumb[] = array(
			'name' => $title,
		);

		$this->set(compact('title','breadcrumb'));
	}
	
	function logout() {
		$this->Session->delete('Auth.GroupUser');
		$this->redirect($this->Auth->logout());
	}
	
	function password() {
		$error = false;
		
		if (!$error) {
			if (!isset($this->data['User']['lost_password']) || !$this->data['User']['lost_password']) {
				$this->_flash(__('Please enter an email address or username.', true),'warning');
				$error = true;
			}
		}
		
		if (!$error) {
			$this->User->recursive = -1;			
			$user = $this->User->findByUsername($this->data['User']['lost_password']);
			if (!$user) {
				$user = $this->User->findByEmail($this->data['User']['lost_password']);
			}
			if (!$user) {
				$this->_flash(__('Account not found.', true),'error');
				$error = true;
			}
		}
		
		if (!$error) {
			$this->Email->to = $user['User']['email'];
			$this->Email->subject = 'New Password for '.Configure::read('Settings.app.name');
			$this->Email->replyTo = Configure::read('Settings.app.email');
			$this->Email->from = Configure::read('Settings.app.name').' &lt;'.Configure::read('Settings.app.email').'>';
			$this->Email->template = 'password'; 
			$this->Email->sendAs = 'both';
			$this->Email->delivery = Configure::read('Settings.smtp.delivery');
			$this->Email->smtpOptions = array(
				'port'=> 25, 
				'host' => 'localhost', 
				'timeout' => 30,
				'username' => Configure::read('Settings.smtp.username'),
				'password' => Configure::read('Settings.smtp.password'),
			);
	
			$this->set(compact('user'));

			if (!$this->Email->send()) {
				debug($this->Email);
				$this->_flash(__('Email could not be sent.', true),'error');
				$error = true;
			}
		}

		if (!$error) {
			$this->_flash(__(sprintf('New password has been sent to %s.',$user['User']['email']), true),'success');
			$this->redirect(array('action'=>'login'));
		}		
		
		$this->login();
		$this->render('login');
	}
	
	//
	// ADMIN ACTIONS
	//

	function admin_index() {
		if (!isset($this->passedArgs['sort'])) {
			$this->paginate['order'] = array('User.id'=>'desc');
		}

		// keywords
		if(isset($this->passedArgs['keywords'])) {
			$keywords = $this->passedArgs['keywords'];
			$this->paginate['conditions'][] = array(
				'OR' => array(
					'User.id' => $keywords,
					'User.username LIKE' => "%$keywords%",
					'User.email LIKE' => "%$keywords%",
				)
			);
			$this->data['Search']['keywords'] = $keywords;
		}

		// username
		if(isset($this->passedArgs['username'])) {
			$this->paginate['conditions'][]['User.username LIKE'] = str_replace('*','%',$this->passedArgs['username']);
			$this->data['Search']['username'] = $this->passedArgs['username'];
		}

		// email
		if(isset($this->passedArgs['email'])) {
			$this->paginate['conditions'][]['User.email LIKE'] = str_replace('*','%',$this->passedArgs['email']);
			$this->data['Search']['email'] = $this->passedArgs['email'];
		}

		// filter by group_id
		if (isset($this->passedArgs['group_id'])) {
			$this->User->bindModel(array(
				'hasOne' => array(
					'GroupToUser' => array(
						'className' => 'GroupToUser',
						'foreign_key' => 'user_id',
					),
				),
			),false);
			$this->paginate['conditions'][]['GroupToUser.group_id'] = $this->passedArgs['group_id'];
			$this->data['Search']['group_id'] = $this->passedArgs['group_id'];
		}

		// load the data		
		$users = $this->paginate();

		// set related data
		$groups = $this->User->Group->find('list');
		$this->set(compact('users','groups'));
	}
	
	function admin_search() {
		$url = array();
		$url['action'] = 'index';
		if (isset($this->data['Search']['keywords']) && $this->data['Search']['keywords']) {
			$url['keywords'] = $this->data['Search']['keywords'];
		}
		if (isset($this->data['Search']['id']) && $this->data['Search']['id']) {
			$url['id'] = $this->data['Search']['id'];
		}
		if (isset($this->data['Search']['username']) && $this->data['Search']['username']) {
			$url['username'] = $this->data['Search']['username'];
		}
		if (isset($this->data['Search']['email']) && $this->data['Search']['email']) {
			$url['email'] = $this->data['Search']['email'];
		}
		if (isset($this->data['Search']['group_id']) && $this->data['Search']['group_id']) {
			$url['group_id'] = $this->data['Search']['group_id'];
		}
		$this->redirect($url, null, true);
	}

	function admin_view($id = null) {
		if (!$id) {
			$this->_flash(__('Invalid User.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
	
		$user = $this->User->read(null, $id);
		$this->set(compact('user'));
	}
	
	function admin_add() {
		$this->admin_form();
		$this->render('admin_form');
	}
	function admin_edit($id = null) {
		if (!$id && empty($this->data)) {
			$this->_flash(__('Invalid User.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
		$this->admin_form($id);
		$this->render('admin_form');
	}

	function admin_form($id = null) {
		// process submit
		if (!empty($this->data)) {

			// get the groups from the checkbox data
			$this->data['Group']['Group'] = array();
			foreach($this->data['Group']['checkbox'] as $k=>$v) {
				if ($v) $this->data['Group']['Group'][] = $k;
			}

			// save the data
			$id = $this->data['User']['id'];
			$this->User->create();
			if (!$id && !$this->data['User']['password_confirm']) {
				$this->data['User']['password_confirm']=' ';
			}
			if ($this->data['User']['password_change']) {
				$this->data['User']['password'] = $this->Auth->password($this->data['User']['password_change']);
			}
			if ($this->User->save($this->data)) {
				$this->_flash(__('The User has been saved.', true),'success');
				$this->redirect(array('action'=>'view', $this->User->id));
			}
		
			$this->_flash(__('The User could not be saved. Please, try again.', true),'warning');
		}
		if (empty($this->data)) {
			$this->data = $this->User->read(null, $id);
		}
		
		$groups = $this->User->Group->find('list');
		$this->set(compact('groups'));
	}
	
	function admin_delete($id = null) {
		if (!$id) {
			$this->_flash(__('Invalid User.', true),'error');
			$this->redirect(array('action'=>'index'));
		}
		$this->User->del($id);
		$this->_flash(__('The User has been deleted.', true),'success');
		$this->redirect($this->referer(), null, true);
	}
	
	function admin_multi_delete() {
		if (!isset($this->params['form']['record']) || !count($this->params['form']['record'])) {
			$this->_flash(__('No records selected.', true),'warning');
			$this->redirect($this->referer(), null, true);
		}
		$ids = array();
		foreach($this->params['form']['record'] as $id=>$v) {
			$ids[] = '#'.$id;
			$this->User->del($id);
		}
		$this->_flash(__(sprintf('Deleted Users - %s.',implode(', ',$ids)),true),'success');
		$this->redirect($this->referer(), null, true);
	}
	
	
	function admin_login() {
		$title = 'Admin Login';
		$this->set(compact('title'));
	}

	function admin_logout() {
		$this->Session->delete('Auth.GroupUser');
		$this->redirect($this->Auth->logout());
	}
	

}
</pre>


<h2>The Views</h2>
<b>views/users/login.php</b>
<pre class="brush:php">
&lt;?php 
if  ($session->check('Message.auth')) $session->flash('auth'); 
echo $form->create('User', array('action' => 'login'));
echo $form->input('username');
echo $form->input('password');
echo $form->end('Login');
</pre>

<b>views/users/index.php</b>
<pre class="brush:php; html-script:true">
&lt;?php debug($auth); ?>
</pre>

<b>views/users/account.php</b>
<pre class="brush:php; html-script:true">
&lt;?php 
echo $form->create('User',array('url'=>array('action'=>'account')));
echo $form->input('email');
echo $form->input('username');
echo $form->input('password_change',array('type'=>'password','after'=>__('Leave blank if you do not wish to change the password.',true)));
echo $form->input('password_confirm',array('type'=>'password'));
echo $form->end('Save');
</pre>

<b>views/users/register.php</b>
<pre class="brush:php; html-script:true">
&lt;?php
echo $form->create('User', array('action' => 'register'));
echo $form->input('email');
echo $form->input('username');
echo $form->input('password_change',array('label'=>__('Password',true),'type'=>'password'));
echo $form->input('password_confirm',array('type'=>'password'));
echo $form->end('Register');
</pre>


<b>views/users/admin_login.php</b>
<pre class="brush:php; html-script:true">
&lt;?php
if  ($session->check('Message.auth')) $session->flash('auth');
echo $form->create('User', array('action' => 'login'));
echo $form->input('username');
echo $form->input('password');
echo $form->end('Login');
</pre>

<b>views/users/admin_index.php</b>
<pre class="brush:php; html-script:true">
&lt;div class="actions">
	&lt;ul>
		&lt;li>&lt;?php echo $html->link(__('New User', true), array('action'=>'add')); ?>&lt;/li>
		&lt;li>&lt;?php echo $html->link(__('Search', true), 'javascript:void(0)', array('class'=>'search-toggle')); ?>&lt;/li>
	&lt;/ul>
&lt;/div>

&lt;div class="users index">

	&lt;h2>&lt;?php __('Users');?>&lt;/h2>

	&lt;?php echo $form->create('User',array('action'=>'search'));?>
		&lt;fieldset>
	 		&lt;legend>&lt;?php __('User Search');?>&lt;/legend>
		&lt;?php
			echo $form->input('Search.keywords');
			echo $form->input('Search.id');
			echo $form->input('Search.username',array(
				'after' => 'wildcard is *',
			));
			echo $form->input('Search.email',array(
				'after' => 'wildcard is *',
			));
			echo $form->input('Search.group_id',array('empty'=>__('All',true)));
			echo $form->submit('Search');
		?>
		&lt;/fieldset>
	&lt;?php echo $form->end();?>

	&lt;?php echo $form->create('User',array('id'=>'UserListForm','url'=>array('controller'=>'users','action'=>'multi')));?>
		&lt;table cellpadding="0" cellspacing="0" class="listTable">
		&lt;tr>
			&lt;th>
				&lt;span class="select_all">a&lt;/span>|&lt;span class="select_none">n&lt;/span>
			&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('id');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('username');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('email');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('created');?>&lt;/th>
			&lt;th>&lt;?php echo $paginator->sort('modified');?>&lt;/th>
			&lt;th class="actions">&lt;?php __('Actions');?>&lt;/th>
		&lt;/tr>
		&lt;?php
		$i = 0;
		foreach ($users as $user):
			$class = null;
			if ($i++ % 2 == 0) {
				$class = ' class="altrow"';
			}
		?>
			&lt;tr&lt;?php echo $class;?>>
				&lt;td>
					&lt;?php echo $form->input($user['User']['id'],array(
						'type'=>'checkbox',
						'label'=>false,
						'name'=>'record['.$user['User']['id'].']',
						'id'=>'listRecord_'.$user['User']['id'],
					)); ?>
				&lt;/td>
				&lt;td>
					&lt;?php echo $user['User']['id']; ?>
				&lt;/td>
				&lt;td>
					&lt;b>&lt;?php echo $user['User']['username']; ?>&lt;/b>
				&lt;/td>
				&lt;td>
					&lt;?php echo $user['User']['email']; ?>
				&lt;/td>
				&lt;td align="center">
					&lt;?php echo str_replace(' ','&lt;br/>',$user['User']['created']); ?>
				&lt;/td>
				&lt;td align="center">
					&lt;?php echo str_replace(' ','&lt;br/>',$user['User']['modified']); ?>
				&lt;/td>
				&lt;td class="actions">
					&lt;?php echo $html->link(__('View', true), array('action'=>'view', $user['User']['id'])); ?>
					&lt;?php echo $html->link(__('Edit', true), array('action'=>'edit', $user['User']['id'])); ?>
					&lt;?php echo $html->link(__('Delete', true), array('action'=>'delete', $user['User']['id']), null, sprintf(__('Are you sure you want to delete # %s?', true), $user['User']['id'])); ?>
				&lt;/td>
			&lt;/tr>
		&lt;?php endforeach; ?>
		&lt;/table>

		&lt;div class="multi_actions">
			&lt;input type="submit" name="data[action][multi_delete]" value="Delete" onclick="return confirm('&lt;?php __('Are you sure you want to delete the selected records?'); ?>');"/>
		&lt;/div>

	&lt;?php echo $form->end();?>
	&lt;?php echo $this->renderElement('paging');?>
&lt;/div>
</pre>

<b>views/users/admin_view.php</b>
<pre class="brush:php; html-script:true">
&lt;div class="actions">
	&lt;ul>
		&lt;li>&lt;?php echo $html->link(__('Edit User', true), array('action'=>'edit', $user['User']['id'])); ?> &lt;/li>
		&lt;li>&lt;?php echo $html->link(__('Delete User', true), array('action'=>'delete', $user['User']['id']), null, sprintf(__('Are you sure you want to delete # %s?', true), $user['User']['id'])); ?> &lt;/li>
		&lt;li>&lt;?php echo $html->link(__('List Users', true), array('action'=>'index')); ?> &lt;/li>
		&lt;li>&lt;?php echo $html->link(__('New User', true), array('action'=>'add')); ?> &lt;/li>
	&lt;/ul>
&lt;/div>

&lt;h2>&lt;?php  __('User');?>&lt;/h2>

&lt;div class="users view">

	&lt;dl>&lt;?php $i = 0; $class = ' class="altrow"';?>
		&lt;dt&lt;?php if ($i % 2 == 0) echo $class;?>>&lt;?php __('Id'); ?>&lt;/dt>
		&lt;dd&lt;?php if ($i++ % 2 == 0) echo $class;?>>
			&lt;?php echo $user['User']['id']; ?>
			&nbsp;
		&lt;/dd>
		&lt;dt&lt;?php if ($i % 2 == 0) echo $class;?>>&lt;?php __('Username'); ?>&lt;/dt>
		&lt;dd&lt;?php if ($i++ % 2 == 0) echo $class;?>>
			&lt;?php echo $user['User']['username']; ?>
			&nbsp;
		&lt;/dd>
		&lt;dt&lt;?php if ($i % 2 == 0) echo $class;?>>&lt;?php __('Email'); ?>&lt;/dt>
		&lt;dd&lt;?php if ($i++ % 2 == 0) echo $class;?>>
			&lt;?php echo $user['User']['email']; ?>
			&nbsp;
		&lt;/dd>
		&lt;dt&lt;?php if ($i % 2 == 0) echo $class;?>>&lt;?php __('Created'); ?>&lt;/dt>
		&lt;dd&lt;?php if ($i++ % 2 == 0) echo $class;?>>
			&lt;?php echo $user['User']['created']; ?>
			&nbsp;
		&lt;/dd>
		&lt;dt&lt;?php if ($i % 2 == 0) echo $class;?>>&lt;?php __('Modified'); ?>&lt;/dt>
		&lt;dd&lt;?php if ($i++ % 2 == 0) echo $class;?>>
			&lt;?php echo $user['User']['modified']; ?>
			&nbsp;
		&lt;/dd>
	&lt;/dl>

&lt;/div>

&lt;div class="related">
	&lt;h3>&lt;?php __('Groups');?>&lt;/h3>
    &lt;?php if (!empty($user['Group'])):?>
        &lt;table cellpadding="0" cellspacing="0" class="listTable">
            &lt;tr>
                &lt;th>&lt;?php __('Id'); ?>&lt;/th>
                &lt;th width="90%">&lt;?php __('Name'); ?>&lt;/th>
                &lt;th class="actions">&lt;?php __('Actions');?>&lt;/th>
            &lt;/tr>
            &lt;?php
	            $i = 0;
				foreach ($user['Group'] as $group):
					$class = null;
					if ($i++ % 2 == 0) {
						$class = ' class="altrow"';
					}
                ?>
                    &lt;tr&lt;?php echo $class;?>>
                        &lt;td>&lt;?php echo $group['id'];?>&lt;/td>
                        &lt;td>&lt;?php echo $group['name'];?>&lt;/td>
                        &lt;td class="actions">
                                &lt;?php echo $html->link(__('View Users', true), array('controller'=> 'users', 'action'=>'index', 'group_id'=>$group['id'])); ?>
                        &lt;/td>
                    &lt;/tr>
            &lt;?php endforeach; ?>
        &lt;/table>
        &lt;?php echo $form->end();?>
    &lt;?php endif; ?>
&lt;/div>
</pre>

<b>views/users/admin_form.php</b>
<pre class="brush:php; html-script:true">
&lt;div class="actions">
	&lt;ul>
		&lt;li>&lt;?php echo $html->link(__('View', true), array('action'=>'view', $form->value('User.id')));?>&lt;/li>
		&lt;li>&lt;?php echo $html->link(__('Delete', true), array('action'=>'delete', $form->value('User.id')), null, sprintf(__('Are you sure you want to delete # %s?', true), $form->value('User.id'))); ?>&lt;/li>
		&lt;li>&lt;?php echo $html->link(__('List Users', true), array('action'=>'index'));?>&lt;/li>
	&lt;/ul>
&lt;/div>

&lt;div class="users form">

	&lt;h2>&lt;?php __('Edit User'); ?>&lt;/h2>


    &lt;?php echo $form->create('User');?>
	&lt;fieldset>
		&lt;legend>&lt;?php __('User');?>&lt;/legend>
	&lt;?php
		echo $form->input('id');
		echo $form->input('email');
		echo $form->input('username');
		echo $form->input('active',array('type'=>'checkbox'));
		echo $form->input('password_change',array('type'=>'password','after'=>__('Leave blank if you do not wish to change the password.',true)));
		echo $form->input('password_confirm',array('type'=>'password'));
	?>
	&lt;/fieldset>

	&lt;fieldset>
 		&lt;legend>&lt;?php __('Groups');?>&lt;/legend>
	&lt;?php
		$checked = $form->value("Group.Group");
		foreach ($groups as $id=>$label) {
			echo $form->input("Group.checkbox.$id", array(
				'label'=>$label,
				'type'=>'checkbox',
				'checked'=>(isset($checked[$id])?'checked':false),
			));
		}
	?>
	&lt;/fieldset>

    &lt;?php echo $form->end('Submit');?>

&lt;/div>
</pre>
