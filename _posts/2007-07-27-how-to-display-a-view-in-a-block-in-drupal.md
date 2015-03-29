---
layout: post
title: How to display a View in a Block in Drupal
tags: [drupal]
redirect_from:
- /code/how-to-display-a-view-in-a-block-in-drupal/
---
If you want to use a view to get the power of pagers but you need it to render in a block then follow this guide.

<!--break-->

Just create a new block and use this as the PHP code:

```php
<?php
print views_build_view('page',views_get_view('your_view_name'),$args,true,10,$page);
```
