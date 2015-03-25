---
layout: post
title: fuser taking 100% cpu on Ubuntu 11.10
created: 1350878708
---
<p>Server was running up super high load thanks to php5's cron task.</p>

<code>/etc/cron.d/php5</code> on Ubuntu 11.10:
<pre class="brush:plain">
09,39 *     * * *     root   [ -x /usr/lib/php5/maxlifetime ] && [ -d /var/lib/php5 ] && find /var/lib/php5/ -depth -mindepth 1 -maxdepth 1 -type f -cmin +$(/usr/lib/php5/maxlifetime) ! -execdir fuser -s {} 2>/dev/null \; -delete
</pre>

<code>/etc/cron.d/php5</code> on Ubuntu 11.04:
<pre class="brush:plain">
09,39 *     * * *     root   [ -x /usr/lib/php5/maxlifetime ] && [ -d /var/lib/php5 ] && find /var/lib/php5/ -depth -mindepth 1 -maxdepth 1 -type f -cmin +$(/usr/lib/php5/maxlifetime) -delete
</pre>

<p>The 11.10 version runs fuser for each PHP session file, thus using all the CPU when there are hundreds of sessions.</p>

<p>Thanks to <a href="http://ubuntuforums.org/showpost.php?p=11370262&postcount=2">grazer for this fix</a>.</p>
