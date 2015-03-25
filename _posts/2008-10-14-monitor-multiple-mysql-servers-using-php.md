---
layout: post
title: Monitor Multiple MySQL Servers using PHP
created: 1223981569
---
<p>This is a quick 1 page application to monitor your replicated MySQL servers.</p>

<p>Use it as you will.  Enjoy!</p>

<!--break-->


<h2>The Code</h2>

<pre class="brush:php; html-script:true">
&lt;?php

$level = (int)$_GET['level'];
$refresh = (int)$_GET['refresh'];

function printServer($host,$user,$pass,$level=0){
	$db = mysql_connect($host,$user,$pass,true);
	mysql_select_db('factory_cre',$db);

	echo '&lt;div class="server">';
	echo '&lt;h2>'.$ip.'&lt;/h2>';

	// Slave Status	
	$stats = mysql_fetch_assoc(mysql_query('SHOW SLAVE STATUS',$db));
	echo '&lt;h3>Slave Status&lt;/h3>';
	echo '&lt;dl>';
	foreach($stats as $label=>$field) {
		$class = array();
		switch($label) {
			case 'Seconds_Behind_Master':
				if ($field!=0)
					$class[]="error";
				break;
			case 'Slave_IO_Running':
				if ($field!='Yes')
					$class[]="error";
				break;
			case 'Slave_SQL_Running':
				if ($field!='Yes')
					$class[]="error";
				break;
			case 'Last_Error':
				if ($field)
					$class[]="error";
				break;
		}
		echo '&lt;dt>'.$label.'&lt;/dt>&lt;dd class="'.implode(' ',$class).'">'.str_replace(',',', ',$field).'&lt;/dd>';
	}
	echo '&lt;/dl>';

	// Master Status	
	$stats = mysql_fetch_assoc(mysql_query('SHOW MASTER STATUS',$db));
	echo '&lt;h3>Master Status&lt;/h3>';
	echo '&lt;dl>';
	foreach($stats as $label=>$field) {
		$class = array();
		echo '&lt;dt>'.$label.'&lt;/dt>&lt;dd class="'.implode(' ',$class).'">'.str_replace(',',', ',$field).'&lt;/dd>';
	}
	echo '&lt;/dl>';

	// Server Status	
	if ($level>0){
		$stats = mysql_query('show status',$db);
		echo '&lt;h3>Server Status&lt;/h3>';
		echo '&lt;dl>';
		while($row = mysql_fetch_assoc($stats)) {
			$class = array();
			echo '&lt;dt class="'.implode(' ',$class).'">'.$row['Variable_name'].'&lt;/dt>&lt;dd class="'.implode(' ',$class).'">'.$row['Value'].'&lt;/dd>';
		}
		echo '&lt;/dl>';
	}

	mysql_close($db);
	echo '&lt;/div>';
}

?>
&lt;!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
&lt;html>

&lt;head>
	&lt;meta http-equiv="content-type" content="text/html; charset=iso-8859-1">
	&lt;?php if($refresh): ?>
		&lt;meta http-equiv="refresh" content="&lt;?php echo $refresh; ?>">
	&lt;?php endif; ?>
	&lt;title>MySQL Server Replication Status 2&lt;/title>
	&lt;style>
	body {
		font-family: Arial;
		font-size: 78%;
	}
	
	h2 { padding: 0; margin:1em 0 0 0; }
	.server{float:left;width:50%;}
	.clear {clear:both}
	.error {background:red}
	dl {
		line-height:1em;
		margin: 0;
		background: #F5FAFA;
		border-top: 1px solid #77BBBF;
		width: 95%;
		margin: 0 auto;
	}
	dl.altrow {
		background: #EFFFFF;
	}
	dt {
		clear: both;
		float: left;
		width: 200px;
		text-align: right;
		padding-right: 10px;
		font-weight: bold;
		background: #C9E7E9;
		padding-left: 1em !important;
		border-top: 1px solid #EFFFFF;
		border-left: 1px solid #77BBBF;
		border-right: 1px solid #77BBBF;
		border-bottom: 1px solid #77BBBF;
		font-size: 11px;
		font-family: "Trebuchet MS", Verdana, Arial, Helvetica, sans-serif;
		color: #4f6b72;
	}
	dd {
		margin-left: 220px !important;
		padding-left: 10px !important;
		border-top: 1px solid #fff;
		border-left: 0;
		border-right: 1px solid #77BBBF;
		border-bottom: 1px solid #77BBBF;
		min-height: 1em;
	}	
	&lt;/style>
&lt;/head>

&lt;body>

	&lt;h1>MySQL Replication Status&lt;/h1>
	&lt;a href="?refresh=0">Refresh off&lt;/a>
	| &lt;a href="?refresh=5">Refresh 5&lt;/a>
	| &lt;a href="?refresh=30">Refresh 30&lt;/a>
	| &lt;a href="?level=1">Expert&lt;/a>

	&lt;?php printServer('123.123.123.1','enter-server-1-username','enter-server-1-password',$level); ?>
	&lt;?php printServer('123.123.123.2','enter-server-2-username','enter-server-2-password',$level); ?>
	&lt;div class="clear">&lt;/div>

&lt;/body>
&lt;/html>
</pre>

<h2>How It Looks</h2>
[inline:monitor-multiple-mysql-servers-php.jpg]
