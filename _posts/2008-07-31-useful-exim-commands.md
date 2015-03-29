---
layout: post
title: Useful Exim Commands
tags: [cpanel]
redirect_from:
- /code/useful-exim-commands/
---
A list of a few commands useful for managing an exim mail server.

<!--break-->

Remove all mail in queue over 7 days old

```
find /var/spool/exim -atime 7 -exec /bin/rm {} \; 
```

Print a count of the messages in the queue:

```
exim -bpc
```

Print a listing of the messages in the queue (time queued, size, message-id, sender, recipient):

```
exim -bp
```

Print a summary of messages in the queue (count, volume, oldest, newest, domain, and totals):

```
exim -bp | exiqsumm
```

Print what Exim is doing right now:

```
exiwhat
```


more exim management commands are available here:

<a href="http://bradthemad.org/tech/notes/exim_cheatsheet.php">http://bradthemad.org/tech/notes/exim_cheatsheet.php</a>
