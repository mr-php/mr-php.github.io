---
layout: post
title: Install Memcache onto cPanel running CentOS
tags: [cpanel]
redirect_from:
- /blog/install-memcache-cpanel-running-centos/
- /code/install-memcache-cpanel-running-centos/
- /code/install-memcache-onto-cpanel-running-centos/
---
Every time I install Memcache on cPanel I get a little bit stuck, so I wrote this quick guide in the hopes of helping myself next time and also helping other people who want the advantages of super fast caching.

<!--break-->

## Make the Sources Folder

First of all lets make a folder to put all our sources in

```
mkdir ~/memcache
```


## Compile and Install LibEvent

Memcache requires <a href="http://monkey.org/~provos/libevent/">LibEvent</a>.  Go to their site and get the latest version.

```
cd ~/memcache
wget http://www.monkey.org/~provos/libevent-1.4.9-stable.tar.gz
tar xvfz libevent-1.4.9-stable.tar.gz
cd libevent-1.4.9-stable
./configure; make; make install
```


## Compile and Install Memcache

Now you can install <a href="http://danga.com/memcached/">Memcache</a>.  Again you should check their site for the latest version.

```
cd ~/memcache
wget http://www.danga.com/memcached/dist/memcached-1.2.6.tar.gz
tar xvfz memcached-1.2.6.tar.gz
cd memcached-1.2.6
./configure --with-lib-event=/usr/local/; make; make install
```


## Starting Memcache

Try starting memcache.

```
memcached
```

If you get the following error then you may beed to register libevent: <code>error while loading shared libraries: libevent-1.4.so.2: cannot open shared object file: No such file or directory</code> then Register LibEvent

```
vi /etc/ld.so.conf.d/libevent-i386.conf
--[paste]--
/usr/local/lib/
--[/paste]--
ldconfig
```


## Installing PHP Memcache

Install the <a href="http://pecl.php.net/package/memcache">PHP Memcache</a> extension.  Check their site for the latest version.

```
cd ~/memcache
wget http://pecl.php.net/get/memcache-3.0.3.tgz
tar xvfz memcache-3.0.3.tgz
cd memcache-3.0.3
phpize
./configure
make
make install
vi /usr/local/lib/php.ini
--[paste]--
extension=memcache.so
--[/paste]--
service httpd restart
```




## Daemon scripts for memcached

Information taken from hxxp://www.vbseo.com/blogs/danny-bembibre/daemon-scripts-memcached-44/.

Create the configuration file

```
touch /etc/memcached.conf
```

And put in:

```
# Memory
-m 5120
# default port
-p 11211
# user to run daemon nobody/apache/www-data
-u nobody
# only listen locally
-l 127.0.0.1
```

Create the startups files

```
touch /etc/init.d/memcached
chmod +x /etc/init.d/memcached
```

Edit with your favorite editor and paste this code

``` 
#!/bin/bash
#
# memcached    This shell script takes care of starting and stopping
#              standalone memcached.
#
# chkconfig: - 80 12
# description: memcached is a high-performance, distributed memory
#              object caching system, generic in nature, but
#              intended for use in speeding up dynamic web
#              applications by alleviating database load.
# processname: memcached
# config: /etc/memcached.conf
# Source function library.
. /etc/rc.d/init.d/functions
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/local/bin/memcached
DAEMONBOOTSTRAP=/usr/local/bin/start-memcached
DAEMONCONF=/etc/memcached.conf
NAME=memcached
DESC=memcached
PIDFILE=/var/run/$NAME.pid
[ -x $DAEMON ] || exit 0
[ -x $DAEMONBOOTSTRAP ] || exit 0
RETVAL=0
start() {
 echo -n $"Starting $DESC: "
 daemon $DAEMONBOOTSTRAP $DAEMONCONF
 RETVAL=$?
 [ $RETVAL -eq 0 ] && touch $PIDFILE
 echo
 return $RETVAL
}
stop() {
 echo -n $"Shutting down $DESC: "
 killproc $NAME
 RETVAL=$?
 echo
 [ $RETVAL -eq 0 ] && rm -f $PIDFILE
 return $RETVAL
}
# See how we were called.
case "$1" in
 start)
  start
  ;;
 stop)
  stop
  ;;
 restart|reload)
  stop
  start
  RETVAL=$?
  ;;
 status)
  status $prog
  RETVAL=$?
  ;;
 *)
  echo $"Usage: $0 {start|stop|restart|status}"
  exit 1
esac
exit $RETVAL
```
 
```
touch /usr/local/bin/start-memcached
chmod +x  /usr/local/bin/start-memcached
```

Edit with your favorite editor and paste this code

```
#!/usr/bin/perl -w
# start-memcached
# 2003/2004 - Jay Bonci <jaybonci@debian.org>
# This script handles the parsing of the /etc/memcached.conf file
# and was originally created for the Debian distribution.
# Anyone may use this little script under the same terms as
# memcached itself.
use strict;
if ($> != 0 and $< != 0) {
 print STDERR "Only root wants to run start-memcached.\n";
 exit;
}
my $etcfile = shift || "/etc/memcached.conf";
my $params = [];
my $etchandle; 
# This script assumes that memcached is located at /usr/bin/memcached, and
# that the pidfile is writable at /var/run/memcached.pid
my $memcached = "/usr/local/bin/memcached";
my $pidfile = "/var/run/memcached.pid";
# If we don't get a valid logfile parameter in the /etc/memcached.conf file,
# we'll just throw away all of our in-daemon output. We need to re-tie it so
# that non-bash shells will not hang on logout. Thanks to Michael Renner for 
# the tip
my $fd_reopened = "/dev/null";
sub handle_logfile {
 my ($logfile) = @_;
 $fd_reopened = $logfile;
}
sub reopen_logfile {
 my ($logfile) = @_;
 open *STDERR, ">>$logfile";
 open *STDOUT, ">>$logfile";
 open *STDIN, ">>/dev/null";
 $fd_reopened = $logfile;
}
# This is set up in place here to support other non -[a-z] directives
my $conf_directives = {
 "logfile" => \&handle_logfile
};
if (open $etchandle, $etcfile) {
 foreach my $line (<$etchandle>) {
  $line =~ s/\#.*//go;
  $line = join ' ', split ' ', $line;
  next unless $line;
  next if $line =~ /^\-[dh]/o;
  if ($line =~ /^[^\-]/o) {
   my ($directive, $arg) = $line =~ /^(.*?)\s+(.*)/; 
   $conf_directives->{$directive}->($arg);
   next;
  }
  push @$params, $line;
 }
}
unshift @$params, "-u root" unless (grep $_ eq '-u', @$params);
$params = join " ", @$params;
if (-e $pidfile) {
 open PIDHANDLE, "$pidfile";
 my $localpid = <PIDHANDLE>;
 close PIDHANDLE;
 chomp $localpid;
 if (-d "/proc/$localpid") {
  print STDERR "memcached is already running.\n"; 
  exit;
 } else {
  `rm -f $localpid`;
 }
}
my $pid = fork();
if ($pid == 0) {
 reopen_logfile($fd_reopened);
 exec "$memcached $params";
 exit(0);
} elsif (open PIDHANDLE,">$pidfile") {
 print PIDHANDLE $pid;
 close PIDHANDLE;
} else {
 print STDERR "Can't write pidfile to $pidfile.\n";
}
```

Test the scripts

``` 
[root@srv01 init.d]# /etc/init.d/memcached restart
Shutting down memcached:                                   [  OK  ]
Starting memcached:                                        [  OK  ]
```

Review if the conf file is well parsed

```
[root@srv01 init.d]# ps aux  | grep memcached
nobody    5966  0.5  0.3 18248 16444 pts/0   S    13:55   0:00 /usr/local/bin/memcached -u root -m 16 -p 11211 -u nobody -l 127.0.0.1
```

Add memcached as autostart daemon

``` 
[root@srv01 init.d]# /sbin/chkconfig memcached on
[root@srv01 init.d]# /sbin/chkconfig --list | grep memcached
memcached       0:off   1:off   2:on    3:on    4:on    5:on    6:off
```