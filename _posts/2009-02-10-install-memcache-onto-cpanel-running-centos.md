---
layout: post
title: Install Memcache onto cPanel running CentOS
tags: [cpanel]
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

If you would like memcache to run as a service you may follow this post by Danny Bembibre:
<a href="http://www.vbseo.com/blogs/danny-bembibre/daemon-scripts-memcached-44/">http://www.vbseo.com/blogs/danny-bembibre/daemon-scripts-memcached-44/</a>