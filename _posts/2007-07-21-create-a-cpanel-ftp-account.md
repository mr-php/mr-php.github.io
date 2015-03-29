---
layout: post
title: Create a cPanel FTP Account
tags: [cpanel]
redirect_from:
- /code/create-a-cpanel-ftp-account/
---

This snippet will allow you to create a cPanel FTP account using PHP.

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

// ftp username
$ftp_user = 'ftpuser';

// ftp password
$ftp_pass = 'ftppass';

// ftp home directory
$ftp_home = 'public_html/ftpuser';

// ftp quota
$ftp_quota = '50';

// create the ftp account (as of cPanel 11.44)
$request = "http://{$cpanel_user}:{$cpanel_pass}@{$cpanel_host}:2082";
$request .= "/execute/Ftp/add_ftp";
$request .= "?user={$ftp_user}";
$request .= "&pass={$ftp_pass}";
$request .= "&homedir={$ftp_home}";
$request .= "&amp;quota={$ftp_quota}";
$result = file_get_contents($request);
echo $result;

// create the ftp account (old method which is now deprecated)
$request = "http://{$cpanel_user}:{$cpanel_pass}@{$cpanel_host}:2082";
$request .= "/frontend/{$cpanel_skin}/ftp/doaddftp.html";
$request .= "?login={$ftp_user}";
$request .= "&password={$ftp_pass}";
$request .= "&homedir={$ftp_home}";
$request .= "&amp;quota={$ftp_quota}";
$result = file_get_contents($request);
echo $result;
```

Full documentation is available here: <a href="http://documentation.cpanel.net/display/SDK/UAPI+Functions">http://documentation.cpanel.net/display/SDK/UAPI+Functions</a>.
