---
layout: post
title: How to display a View in a Block in Drupal
created: 1185521033
---
If you want to use a view to get the power of pagers but you need it to render in a block then follow this guide.

<!--break-->

Just create a new block and use this as the PHP code:

```php
<?php
print views_build_view('page',views_get_view('your_view_name'),$args,true,10,$page);
```
