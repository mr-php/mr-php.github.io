---
layout: post
title: Fully Qualified Domain Name and Base Path
---
This simple snippet will provide you with a HTTP or HTTPS Fully Qualified Domain Name URL and Base Path to your CakePHP installation.  I use it for the HTML base tag.

<!--break-->

Thanks to Nate for pointing out the best way to do this in CakePHP 1.2:
```php
<base href="<?php echo Router::url("/", true); >" />
```

For historical purposes, here is the CakePHP 1.1 way of doing it.
```php
<base href="<?php echo (env('HTTPS') ? 'https://' : 'http://') . env('HTTP_HOST') . $this->webroot; ?>" />
```
