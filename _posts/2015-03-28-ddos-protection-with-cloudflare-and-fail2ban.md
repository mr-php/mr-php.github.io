---
layout: post
title: DDos Protection with Cloudflare and Fail2Ban
excerpt: Use CloudFlare API to automatically block attacking IP addresses from visiting your server.
tags: [security, ubuntu]
---

One of my favorite tools at the moment is <a href="https://www.cloudflare.com/">CloudFlare</a>.  They provide a free DNS (domain name server) with a built in CDN (content delivery network).  They even let you use an SSL certificate so you get `https://example.com`.

In addition to all these great features, they are also world leaders in DDOS (distributed denial of service) mitigation.
 
Despite their techniques a DDOS can still occur on your site.  This is where Fail2Ban comes in.  

<a href="http://www.fail2ban.org/">Fail2Ban</a> scans log files and bans IPs that show the malicious signs.  For example too many password failures, seeking for exploits, etc.  It can also be configured to block a non-distributed DOS attack, which makes life harder for the attacker as they will have to continue to get new IP addresses.

This article will show you how to use CloudFlare's API to automatically block attacking IP addresses from visiting your server.  


## Enable CloudFlare CDN

To enable CDN login to cloudflare.com and go to your DNS settings.  Make sure the cloud-arrow icon is enabled (orange with arrow passing through the cloud).


## Logging Real IP

When using CloudFlare's CDN real visitors will not be visiting your site directly.  Instead you will get a request from one of CloudFlare's CDN servers.

Before we can start banning IP addresses we need to know the real visitors IP because banning CloudFlare's CDN servers won't have a positive outcome. 

Luckily CloudFlare created a tool to help those of us using Apache called <a href="https://www.cloudflare.com/resources-downloads#mod_cloudflare">mod_cloudflare</a>.

mod_cloudflare has a few software dependencies that need to be installed first:

```
apt-get install libtool apache2-dev
```

Note: If you find that you are unable to install apache2-dev then you should install:

```
apt-get install libtool apache2-threaded-dev
```

Next, you should download the mod_cloudflare source to your server:

```
wget https://www.cloudflare.com/static/misc/mod_cloudflare/mod_cloudflare.c
```

Install the module. Depending on your system, the command to run might be `apxs` or `apxs2`. So, run one of the below two commands. If you get a "Command not found" when running one, try the other:

```
apxs -a -i -c mod_cloudflare.c
apxs2 -a -i -c mod_cloudflare.c
```


## Fail2Ban Configuration

Now that we have real visitors IP addresses going into our apache log file, we can start blacklisting those that exceed limits.
 

### Jail

The jail is the way we tell fail2ban who we want to ban, for how long, and who we should notify about it.

Create a new jail called `http-dos` by adding the following to your `/etc/fail2ban/jail.conf` file:

```
[http-dos]
enabled  = true
filter   = http-dos
action   = cloudflare-blacklist
#           sendmail-whois[name=http-dos, dest=me@example.com]
#           sendmail-whois-lines[name=http-dos, dest=me@example.com, logpath=/var/log/apache2/access.log]
logpath  = /usr/local/apache2/access.log
maxretry = 300
findtime = 300
bantime  = 604800
```

If you would like to be notified then uncomment the `sendmail-whois` lines, or the `sendmail-whois-lines` if you also want to be emailed the matching log files.

`maxretry` is the number of times the same IP is allowed to visit in `findtime` seconds.  `bantime` is the number of seconds the IP will be blacklisted.
   
In the example above an IP will be blacklisted for 7 days if it appears in the log file 300 times in 300 seconds.


### Filter

We tell fail2ban how to understand our log files by defining a filter. 

The following should be added to a new file called `/etc/fail2ban/filter.d/http-dos.conf`.

```
[Definition]
 
# Option:  failregex
# Notes.:  regex to match the password failure messages in the logfile. The
#          host must be matched by a group named "host". The tag "<HOST>" can
#          be used for standard IP/hostname matching and is only an alias for
#          (?:::f{4,6}:)?(?P<host>\S+)
# Values:  TEXT
#
failregex = ^<HOST> -.*"(GET|POST).*
 
# Option:  ignoreregex
# Notes.:  regex to ignore. If this regex matches, the line is ignored.
# Values:  TEXT
#
ignoreregex =
```

The above filter will find the IP (`HOST`) for all `GET` and `POST` requests.


### Action

Actions control what fail2ban does when a jail blacklist is triggered.

You will need to add the following to a new file called `/etc/fail2ban/action.d/cloudflare-blacklist.conf`.

Don't forget to set `cftoken` and `cfuser` at the bottom.  You can get your <a href="https://www.cloudflare.com/my-account">API token here</a>.

```
#
# Author: Mike Rushton
# Source: https://github.com/fail2ban/fail2ban/blob/master/config/action.d/cloudflare.conf
# Referenced from: http://www.normyee.net/blog/2012/02/02/adding-cloudflare-support-to-fail2ban by NORM YEE
#
# To get your Cloudflare API key: https://www.cloudflare.com/my-account
#

[Definition]

# Option:  actionstart
# Notes.:  command executed once at the start of Fail2Ban.
# Values:  CMD
#
actionstart =

# Option:  actionstop
# Notes.:  command executed once at the end of Fail2Ban
# Values:  CMD
#
actionstop =

# Option:  actioncheck
# Notes.:  command executed once before each actionban command
# Values:  CMD
#
actioncheck =

# Option:  actionban
# Notes.:  command executed when banning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    <ip>  IP address
#          <failures>  number of failures
#          <time>  unix timestamp of the ban time
# Values:  CMD
#
actionban = curl https://www.cloudflare.com/api_json.html -d 'a=ban' -d 'tkn=<cftoken>' -d 'email=<cfuser>' -d 'key=<ip>'
# Option:  actionunban
# Notes.:  command executed when unbanning an IP. Take care that the
#          command is executed with Fail2Ban user rights.
# Tags:    <ip>  IP address
#          <failures>  number of failures
#          <time>  unix timestamp of the ban time
# Values:  CMD
#
actionunban = curl https://www.cloudflare.com/api_json.html -d 'a=nul' -d 'tkn=<cftoken>' -d 'email=<cfuser>' -d 'key=<ip>'


[Init]

# Default Cloudflare API token
cftoken = your-api-key-here

# Default Cloudflare username
cfuser = me@example.com
```

This action will call CloudFlare's API and ban an IP address.  It also manages unbanning after the blacklist expires.


## Notes

At the time of this writing CloudFlare's API does not support banning IPv6 addresses.  You may want to disable IPv6 on your network card and in CloudFlare's settings if you have IPv6 dos attacks.


## References

* <a href="https://github.com/fail2ban/fail2ban/blob/master/config/action.d/cloudflare.conf">cloudflare.conf by Mike Rushton</a>
* <a href="http://www.normyee.net/blog/2012/02/02/adding-cloudflare-support-to-fail2ban">Adding Cloudflare support to fail2ban by normyee.net</a>
* <a href="http://kiteplans.info/2013/03/18/centos-virtualminfail2ban-protect-apache-from-ddos-attack/">CentOS 6 Virtualmin – fail2ban protect Apache from DDOS Attack by kiteplans.info</a> 

