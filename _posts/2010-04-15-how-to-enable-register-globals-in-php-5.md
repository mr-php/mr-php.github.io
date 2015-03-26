---
layout: post
title: How to Enable Register Globals in PHP 5
tags: [php]
---
If you understand the potential security risks but you still need to run PHP with register_globals ON there are a couple of ways to do it.

If you have access to the servers php.ini then its fairly easy, however if you don't have access to that file or if you are not willing to make this change server wide then there are other ways to go about it.

<!--break-->

## php.ini

In your servers php.ini simply set.

```
register_globals=1
```

## .htaccess

If you don't have access to your servers php.ini file, you may be able to create/edit a .htaccess file in the same folder as your php file.  Simply add this code:

```
php_flag register_globals 1
```

## coded solution

If neither of the solutions above are available to you, then you need to get your hands a little bit dirty.  The following code was submitted to the PHP Manual by Ruquay K Calloway.  Simply add the following to the top of your PHP script:

```
<?php
include('register_globals.php');
register_globals();
```

And then add the following into a new file called `register_globals.php`:

```php
<?php
/**
 * function to emulate the register_globals setting in PHP
 * for all of those diehard fans of possibly harmful PHP settings :-)
 * @author Ruquay K Calloway
 * @param string $order order in which to register the globals, e.g. 'egpcs' for default
 * @link hxxp://www.php.net/manual/en/security.globals.php#82213
 */
function register_globals($order = 'egpcs')
{
    // define a subroutine
    if(!function_exists('register_global_array'))
    {
        function register_global_array(array $superglobal)
        {
            foreach($superglobal as $varname => $value)
            {
                global $$varname;
                $$varname = $value;
            }
        }
    }
   
    $order = explode("\r\n", trim(chunk_split($order, 1)));
    foreach($order as $k)
    {
        switch(strtolower($k))
        {
            case 'e':    register_global_array($_ENV);        break;
            case 'g':    register_global_array($_GET);        break;
            case 'p':    register_global_array($_POST);        break;
            case 'c':    register_global_array($_COOKIE);    break;
            case 's':    register_global_array($_SERVER);    break;
        }
    }
}

/**
 * Undo register_globals
 * @author Ruquay K Calloway
 * @link hxxp://www.php.net/manual/en/security.globals.php#82213
 */
function unregister_globals() {
    if (ini_get(register_globals)) {
        $array = array('_REQUEST', '_SESSION', '_SERVER', '_ENV', '_FILES');
        foreach ($array as $value) {
            foreach ($GLOBALS[$value] as $key => $var) {
                if ($var === $GLOBALS[$key]) {
                    unset($GLOBALS[$key]);
                }
            }
        }
    }
}
```
