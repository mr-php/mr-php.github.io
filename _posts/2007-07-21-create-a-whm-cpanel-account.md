---
layout: post
title: Create a WHM/cPanel Account
created: 1185025162
---
This snippet will allow you to create a cPanel account using PHP.
<!--break-->

<pre class="brush:php">
// your WHM username
$whm_user = 'root';

// your WHM password
$whm_pass = 'password';

// your WHM hostname
$whm_host = '123.123.123.123';

// new account domain or subdomain name
$user_domain = 'newdomain.com';

// new account username (8 characters or less)
$user_name = 'newuser';

// new account password
$user_pass = 'password'

// new account contact email
$user_email = 'user@domain.com';

// new account plan (must be an existing WHM plan)
$user_plan = 'basic';

// create the account
$site = "http://{$whm_user}:{$whm_pass}@{$whm_host}:2086/scripts/wwwacct";
$params = "?plan={$user_plan}";
$params .= "&domain={$user_domain}";
$params .= "&username={$user_name}";
$params .= "&password={$user_pass}";
$params .= "&contactemail={$user_email}";
$result = file_get_contents($site.$params);
echo $result;
</pre>
