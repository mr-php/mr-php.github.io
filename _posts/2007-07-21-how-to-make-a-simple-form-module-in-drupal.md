---
layout: post
title: How to make a simple form module in Drupal
tags: [drupal]
redirect_from:
- /blog/how-make-simple-form-module-drupal/
- /code/how-make-simple-form-module-drupal/
- /code/how-to-make-a-simple-form-module-in-drupal/
---

This example module will provide a form where you can enter your name and upon submission will display your name as a message on the following page.  It is very basic but will give you a start to making your first module.

<!--break-->

You can change all instances of the word example to the name of your module.

First you need to create a file called `example.info`:
```
name = Example
description = "Example module."
version = "5.x-1.0"
project = "example"
```

Next you need the `example.module` file:
```php
<?php

function example_help($section) {
  switch ($section) {
    case 'admin/modules#description':
      return t('This module implements an example form.');
  }
}

function example_menu($may_cache) {
  $items = array();
  if ($may_cache) {
    $items[] = array(
      'path' => 'example',
      'title' => t('Example'),
      'callback' => 'example_page',
      'access' => TRUE,
      'type' => MENU_CALLBACK
    );
  }
  return $items;
}

function example_page() {
  return drupal_get_form('example_page_form');
}

function example_page_form() {
  $form['fullname'] = array(
    '#type' => 'textfield',
    '#title' => t('Enter your full name'),
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );
  return $form;
}

function example_page_form_submit($form_id, $form_values) {
  $message = 'You have submitted the ' . $form_id . ' form which contains the following data: ' . print_r($form_values,true);
  drupal_set_message(t($message));
}
```

Now you can enable the module, and visit <b>http://yoursite.com/example</b>.
