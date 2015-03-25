---
layout: post
title: Useful Exim Commands
created: 1217490752
---
A list of a few commands useful for managing an exim mail server.

<!--break-->

Remove all mail in queue over 7 days old
<pre class="brush:plain">
find /var/spool/exim -atime 7 -exec /bin/rm {} \; 
</pre>

Print a count of the messages in the queue:
<pre class="brush:plain">
exim -bpc
</pre>

Print a listing of the messages in the queue (time queued, size, message-id, sender, recipient):
<pre class="brush:plain">
exim -bp
</pre>

Print a summary of messages in the queue (count, volume, oldest, newest, domain, and totals):
<pre class="brush:plain">
exim -bp | exiqsumm
</pre>

Print what Exim is doing right now:
<pre class="brush:plain">
exiwhat
</pre>


more exim management commands are available here:

<a href="http://bradthemad.org/tech/notes/exim_cheatsheet.php">http://bradthemad.org/tech/notes/exim_cheatsheet.php</a>
