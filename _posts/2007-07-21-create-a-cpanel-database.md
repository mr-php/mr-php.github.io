---
layout: post
title: Create a cPanel Database
tags: [cpanel]
redirect_from:
- /blog/create-cpanel-database/
- /code/create-a-cpanel-database/
- /code/create-a-cpanel-database/
---

This snippet will allow you to create a cPanel database using PHP.

<!--break-->

```php
<?php

// your cPanel username
$cpanel_user = 'root';

// your cPanel password
$cpanel_pass = 'password';

// your cPanel skin
$cpanel_skin = 'x2';

// your cPanel domain
$cpanel_host = 'yourdomain.com';

// database username
$db_user = 'dbuser';

// database password
$db_pass = 'dbpass';

// create the database (as of cPanel 11.44)
$site = "http://$cpanel_user:$cpanel_pass@$cpanel_host:2082/execute/Mysql/";
$result = file_get_contents("{$site}create_database?name=$db_name");
$result .= file_get_contents("{$site}create_user?name={$db_username}&password={$db_userpass}");
$result .= file_get_contents("{$site}set_privileges_on_database?user={$db_username}&database={$db_name}&privileges=ALL");

// create the database (old method which is now deprecated)
$site = "http://$cpanel_user:$cpanel_pass@$cpanel_host:2082/frontend/$cpanel_skin/sql/";
$result = file_get_contents("{$site}adddb.html?db=$db_name");
$result .= file_get_contents("{$site}adduser.html?user={$db_username}&pass={$db_userpass}");
$result .= file_get_contents("{$site}addusertodb.html?user={$cpanel_user}_{$db_username}&db={$cpanel_user}_{$db_name}&ALL=ALL");
```


Full documentation is available here: <a href="http://documentation.cpanel.net/display/SDK/UAPI+Functions">http://documentation.cpanel.net/display/SDK/UAPI+Functions</a>.
