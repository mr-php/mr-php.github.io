---
layout: post
title: Multiple Primary Keys in CakePHP
excerpt: If you have ever tried to deal with multiple primary keys in cakePHP then you have probably hit a brick wall at some stage. Although you still need to add a single id field, this example will allow you to save your data without needing to know the id.
tags: [cakephp]
redirect_from:
- /blog/multiple-primary-keys-cakephp/
- /code/multiple-primary-keys-cakephp/
- /code/multiple-primary-keys-in-cakephp/
- /code/code-category/cakephp/cakephp-1-2/multiple-primary-keys-cakephp/
---

<div class="alert alert-warning" role="alert">
	<p><strong>Warning:</strong> This guide was written for <span class="label label-primary">CakePHP v1.x</span>.</p>
	<p>If you notice any other changes required in newer versions of CakePHP please leave a comment below.</p>
</div>

If you have ever tried to deal with multiple primary keys in cakePHP then you have probably hit a brick wall at some stage.

Although you still need to add a single id field, this example will allow you to save your data without needing to know the id.


## Usage

```php
<?php
$this->GroupToUser->save(array(
	'user_id' => 111,
	'group_id' => 222, 
	'another_field' => 'my data', 
));
```

SQL generated when row does not exist

```sql
SELECT `GroupToUser`.`id` FROM `groups_to_users` AS `GroupToUser` WHERE `GroupToUser`.`user_id` = 111 AND `GroupToUser`.`group_id` = 222 LIMIT 1;
INSERT INTO `groups_to_users` (`user_id`, `group_id`, `another_field`) VALUES (111, 222, 'my data');
```

SQL generated when row exists

```sql
SELECT `GroupToUser`.`id` FROM `groups_to_users` AS `GroupToUser` WHERE `GroupToUser`.`user_id` = 111 AND `GroupToUser`.`group_id` = 222 LIMIT 1
UPDATE `groups_to_users` SET `user_id` = 111, `group_id` = 222, `another_field` = 'my data' WHERE `groups_to_users`.`id` = 9
```


## Here Is The Magic

```php
<?php
class GroupToUser extends AppModel {

	var $name = 'GroupToUser';
	var $useTable = 'groups_users';

	var $primaryKeyArray = array('user_id','group_id');
	
	function exists($reset = false) {
		if (!empty($this->__exists) && $reset !== true) {
			return $this->__exists;
		}
		$conditions = array();
		foreach ($this->primaryKeyArray as $pk) {
			if (isset($this->data[$this->alias][$pk]) && $this->data[$this->alias][$pk]) {
				$conditions[$this->alias.'.'.$pk] = $this->data[$this->alias][$pk];
			}
			else {
				$conditions[$this->alias.'.'.$pk] = 0;
			}
		}
		$query = array('conditions' => $conditions, 'fields' => array($this->alias.'.'.$this->primaryKey), 'recursive' => -1, 'callbacks' => false);
		if (is_array($reset)) {
			$query = array_merge($query, $reset);
		}
		if ($exists = $this->find('first', $query)) {
			$this->__exists = 1;
			$this->id = $exists[$this->alias][$this->primaryKey];
			return true; 
		}
		else {
			return parent::exists($reset);
		}
	}
	
}
```
