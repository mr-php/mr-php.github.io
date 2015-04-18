---
layout: post
title: Create a cPanel Subdomain
tags: [cpanel]
redirect_from:
- /blog/create-cpanel-subdomain/
- /code/create-cpanel-subdomain/
- /code/create-a-cpanel-subdomain/
---
This snippet will allow you to create a cPanel subdomain using PHP.

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

// subdomain name
$subdomain = 'mysubdomain';

// create the subdomain

$sock = fsockopen($cpanel_host,2082);
if(!$sock) {
  print('Socket error');
  exit();
}

$pass = base64_encode("$cpanel_user:$cpanel_pass");
$in = "GET /frontend/$cpanel_skin/subdomain/doadddomain.html?rootdomain=$cpanel_host&domain=$subdomain\r\n";
$in .= "HTTP/1.0\r\n";
$in .= "Host:$cpanel_host\r\n";
$in .= "Authorization: Basic $pass\r\n";
$in .= "\r\n";

fputs($sock, $in);
while (!feof($sock)) {
  $result .= fgets ($sock,128);
}
fclose($sock);

echo $result;
```

If you want to delete the subdomain then change <strong>doadddomain.html</strong> to <strong>dodeldomain.html</strong>.

