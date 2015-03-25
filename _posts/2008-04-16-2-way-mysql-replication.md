---
layout: post
title: 2-Way MySQL Replication
created: 1208350010
---
Some notes and commands I want to keep handy the next time I setup MySQL replication.
<!--break-->

<h2>Pre-Setup Information</h2>
<ul>
<li>
Make sure both server have exactly the same MySQL version.
</li>
<li>
Make sure both server are in the same time zone.
</li>
<li>
Make sure you do not have any fields in your current database with unique keys (other than the primary key).
</li>
</ul>


<h2>Some Notes</h2>
<pre class="brush:plain">
#-----
# SERVER_1: CHANGES TO my.cnf
#-----

server-id = 1
auto_increment_offset = 1


#-----
# SERVER_2: CHANGES TO my.cnf
#-----

server-id = 2
auto_increment_offset = 2

#-----
# SERVER_1 & SERVER_2: CHANGES TO my.cnf
#-----

auto_increment_increment = 10
replicate-do-db = mydb1
replicate-do-db = mydb2

# daisy chain updates
log-slave-updates
replicate-same-server-id = 0

# file locations
log-bin = /var/lib/mysql/logs/log-bin
log-bin-index = /var/lib/mysql/logs/log-bin-index
log-error = /var/lib/mysql/logs/log-error
relay-log = /var/lib/mysql/logs/relay-log
relay-log-info-file = /var/lib/mysql/logs/relay-log-info-file
relay-log-index = /var/lib/mysql/logs/relay-log-index

# for removing old logs
expire-logs-days = 14
max_binlog_size  = 10G



#-----
# SERVER_1 & SERVER_2: GRANT PERMISSIONS
#-----

GRANT REPLICATION SLAVE ON *.* TO 'replicate'@'%' IDENTIFIED BY 'mypassword';
GRANT REPLICATION CLIENT ON *.* TO 'replicate'@'%';
GRANT SUPER ON *.* TO 'replicate'@'%';
GRANT RELOAD ON *.* TO 'replicate'@'%';
GRANT SELECT ON *.* TO 'replicate'@'%';
GRANT DROP ON *.* TO 'replicate'@'%';
GRANT ALTER ON *.* TO 'replicate'@'%';
FLUSH PRIVILEGES; 


#-----
# USEFUL COMMANDS
#-----

STOP SLAVE;
START SLAVE;
SHOW MASTER STATUS;
SHOW SLAVE STATUS \G;
SHOW BINLOG EVENTS;

#-----
# skip last replication error
#-----
SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1;
START SLAVE;

#-----
# create fresh binlog file
#-----
FLUSH LOGS;

#-----
# CREATE SLAVE ON SERVER_2
#-----

CHANGE MASTER TO
  MASTER_HOST='SERVER_1_IP',
  MASTER_USER='replicate',
  MASTER_PASSWORD='mypassword',
  MASTER_PORT=3306,
  MASTER_CONNECT_RETRY=10;


#-----
# CREATE SLAVE ON SERVER_1
#-----

CHANGE MASTER TO
  MASTER_HOST='SERVER_2_IP',
  MASTER_USER='replicate',
  MASTER_PASSWORD='mypassword',
  MASTER_PORT=3306,
  MASTER_CONNECT_RETRY=10;


#-----
# CHANGE THE LOG FILE AND POSITION
#-----

CHANGE MASTER TO MASTER_LOG_FILE = 'master-bin.000038', MASTER_LOG_POS = 0;



#-----
# BACKUPS
#-----

mysql> stop slave;
mysql> flush tables with read lock;
sh> mysqldump mydb | gzip -9 > mydb.gz
mysql> unlock tables;

</pre>


<h2>PHP CLI Script to Ensure Matching Data</h2>
<pre class="brush:php">
# command line usage:
# php mysql_check_replication.php
#
# requires maatkit tools - www.maatkit.org
#
# by Brett ODonnell @ www.mrphp.com.au
#
# Please note this saves your replication users password in the output and log file
# so that you can easily copy and paste it to fix issues.  Adjust to suit your taste.
#

/**
 *  SETTINGS
**/

$debug = true;

$db[0]['host'] = 'master1.your.com';
$db[0]['user'] = 'replicate';
$db[0]['pass'] = 'mypassword';

$db[1]['host'] = 'master2.your.com';
$db[1]['user'] = 'replicate';
$db[1]['pass'] = 'mypassword';

$databases = array(
	'mydb1',
	'mydb1',
);
$folder = '/home/factory/scripts/replication-check'; 
$date = date('Y-m-d_H-i-s'); // for filenames
$checksum_file = "{$folder}/{$date}.checksums";
$log_file = "{$folder}/{$date}.log";


/**
 *  some setup stuff
**/
set_time_limit(60*60);
$_output = '';
function output($o){
	global $_output;
	$_output .= $o;
	echo $o;
}


/**
 *  check all tables (from US)
**/
output("Checking databases at {$date}:");

$_databases = implode(',',$databases);
$cmd = "mk-table-checksum h={$db[0]['host']},u={$db[0]['user']},p={$db[0]['pass']} h={$db[1]['host']},u={$db[1]['user']},p={$db[1]['pass']} --databases={$_databases} --slavelag | mk-checksum-filter | tee {$checksum_file}";
if($debug) output("{$cmd}\n"); 
`$cmd`;

if (file_exists($checksum_file)) {
	$checksum_data = file_get_contents($checksum_file);
	
	// format the data in a nice array
	$checksum_data = explode("\n",$checksum_data);
	foreach ($checksum_data as $k=>$v) {
		$v = trim($v);
		while(strpos($v,'  ')) $v = str_replace('  ',' ',$v);
		if ($v)
			$checksum_data[$k] = explode(' ',$v);
		else
			unset($checksum_data[$k]);
	}
	
	// get the table issues
	foreach ($checksum_data as $cs) {
		$database = $cs[0];
		$table = $cs[1];
		$file = "{$folder}/{$date}.sync.{$table}.sql";
		
		// generate sql changes required to sync
		$cmd = "mk-table-sync --synctomaster h={$db[1]['host']},u={$db[1]['user']},p={$db[1]['pass']},D={$database},t={$table} --print | tee {$file}";
		if($debug) output("{$cmd}\n");
		`$cmd`;
		
		// get contents of sql changes
		if (file_exists($file)) {
			$file_data = file_get_contents($file);
			if ($file_data) {
				
				// suggestions to fix
				$fixes = array();
		
				// run the previewed changes
				$fixes[] = "
					# run the previewed changes
					mysql -h{$db[1]['host']} -u{$db[1]['user']} -p{$db[1]['pass']} {$database} < {$file};
				"; 
				
				// check the difference between 2 rows
				$diff_file = array();
				$diff_file[0] = "{$folder}/{$date}.diff.{$table}.{$database}.{$db[0]['host']}";
				$diff_file[1] = "{$folder}/{$date}.diff.{$table}.{$database}.{$db[1]['host']}";
				$fixes[] = "
					# check the difference between 2 rows
					echo \"SELECT * FROM {$table} WHERE id=123;\" | mysql -h{$db[0]['host']} -u{$db[0]['user']} -p{$db[0]['pass']} {$database} | tee {$diff_file};
					echo \"SELECT * FROM {$table} WHERE id=123;\" | mysql -h{$db[1]['host']} -u{$db[1]['user']} -p{$db[1]['pass']} {$database} | tee {$diff_file};
					diff {$diff_file[0]} {$diff_file[1]}
				";
		
				// sync table from master - no questions asked (not recommended)
				$fixes[] = "
					# sync table from master - no questions asked (not recommended)
					mk-table-sync --synctomaster h={$db[1]['host']},u={$db[1]['user']},p={$db[1]['pass']},D={$db},t={$table} --print --execute | tee {$file};
				";

				// tell someone who cares
				output("Found non-synced data in {$table}.{$database}:\n");				
				output(trim($file_data)."\n\n");
				output("Here are some fixes you might like to try:\n\n");
				foreach($fixes as $fix) {
					$fix = trim($fix);
					while(strpos($fix,'  ')) $fix = str_replace('  ',' ',$fix);
					output("{$fix}\n\n");
				}
			}
		}
		
	}
}

// email $_output ?
file_put_contents($log_file,$_output);
</pre>


<h2>More Information</h2>
<p>also see this site for more mysql replication help tools:<br/><a href="http://www.maatkit.org/">http://www.maatkit.org/</a></p>
<p>lots of useful links on replication:<br/><a href="http://forums.mysql.com/read.php?26,198705,198705">http://forums.mysql.com/read.php?26,198705,198705</a></p>
