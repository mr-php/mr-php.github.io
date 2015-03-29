---
layout: post
title: fuser taking 100% cpu on Ubuntu 11.10
tags: [ubuntu]
redirect_from:
- /code/fuser-taking-100-cpu-on-ubuntu-11-10/
---
Server was running up super high load thanks to php5's cron task.

<!--break-->

`/etc/cron.d/php5` on Ubuntu 11.10:

```
09,39 *     * * *     root   [ -x /usr/lib/php5/maxlifetime ] && [ -d /var/lib/php5 ] && find /var/lib/php5/ -depth -mindepth 1 -maxdepth 1 -type f -cmin +$(/usr/lib/php5/maxlifetime) ! -execdir fuser -s {} 2>/dev/null \; -delete
```

`/etc/cron.d/php5` on Ubuntu 11.04:

```
09,39 *     * * *     root   [ -x /usr/lib/php5/maxlifetime ] && [ -d /var/lib/php5 ] && find /var/lib/php5/ -depth -mindepth 1 -maxdepth 1 -type f -cmin +$(/usr/lib/php5/maxlifetime) -delete
```

The 11.10 version runs fuser for each PHP session file, thus using all the CPU when there are hundreds of sessions.

Thanks to <a href="http://ubuntuforums.org/showpost.php?p=11370262&postcount=2">grazer for this fix</a>.
