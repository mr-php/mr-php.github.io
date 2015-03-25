---
layout: post
title: Linux Processes and CPU Usage
created: 1217491732
---
<p>
If you want to know exactly what your server is doing right now then read on.
Although this is not PHP/MySQL related, it is still very relevant for any web developer who is managing the servers they develop on.
</p>
<!--break-->
<p>
This topic lists a stack of commands to help you to understand what is happening inside the box.  Check it out:
http://forums.linuxwebadmin.info/index.php/topic,51.0.html
</p>
<p>
<b>Update - As this link seems to be broken I have pasted the comments here:</b>
</p>
<p>
about linux processes and cpu usage - lsof, ps, fuser 
</p>
<p>
 <span style="text-decoration: underline"><strong>Important PS command:</strong></span><br />
<br />
I use the following ps commands in order to check for performance probelms:<br />
<strong><br />
1) Displaying top CPU_consuming processes:</strong><br />
<br />
<span style="color: Blue">ps aux | head -1; ps aux | sort -rn +2 | head -10</span><br />
<br />
<strong>2) Displaying top 10 memory-consuming processes:</strong><br />
<br />
<span style="color: Blue">ps aux | head -1; ps aux | sort -rn +3 | head</span><br />
<br />
<strong>3) Displaying process in order of being penalized:</strong><br />
<br />
<span style="color: Blue">ps -eakl | head -1; ps -eakl | sort -rn +5</span><br />
<br />
<strong>4) Displaying process in order of priority:</strong><br />
<br />
<span style="color: Blue">ps -eakl | sort -n +6 | head</span><br />
<br />
<strong>5) Displaying process in order of nice value</strong><br />
<br />
<span style="color: Blue">ps -eakl | sort -n +7</span><br />
<br />
<strong>6) Displaying the process in order of time</strong><br />
<br />
<span style="color: Blue">ps vx | head -1;ps vx | grep -v PID | sort -rn +3 | head -10</span><br />
<br />
<strong>7) Displaying the process in order of real memory use</strong><br />
<br />
<span style="color: Blue">ps vx | head -1; ps vx | grep -v PID | sort -rn +6 | head -10</span><br />
<br />
<strong>8) Displaying the process in order of I/O</strong><br />
<br />
<span style="color: Blue">ps vx | head -1; ps vx | grep -v PID | sort -rn +4 | head -10</span><br />
<br />
<strong>9) Displaying WLM classes</strong><br />
<br />
<span style="color: Blue">ps -a -o pid, user, class, pcpu, pmem, args</span><br />
<br />
<strong>10) Determinimg process ID of wait processes:</strong><br />
<br />
<span style="color: Blue">ps vg | head -1; ps vg | grep -w wait</span><br />
<br />
<strong>11) Wait process bound to CPU</strong><br />
<br />
<span style="color: Blue">ps -mo THREAD -p &lt;PID&gt;</span><br />
<br />
<br />
<span style="text-decoration: underline"><strong>lsof:</strong></span><br />
<br />
<strong>       To list all open files, use:</strong><br />
      <br />
<span style="color: Blue">             # lsof</span><br />
<br />
<strong>       To list all open Internet, x.25 (HP-UX), and UNIX domain files, use:</strong><br />
<br />
<span style="color: Blue">        # lsof -i -U</span><br />
<br />
<strong>       To list all open IPv4 network files in use by the process whose PID is 1234, use:</strong><br />
<br />
<span style="color: Blue">             # lsof -i 4 -a -p 1234</span><br />
<br />
<strong>       To list all files using any protocol on ports 513, 514, or 515 of host wonderland.cc.purdue.edu, use:</strong><br />
<span style="color: Blue"><br />
             # lsof -i @wonderland.cc.purdue.edu:513-515</span><br />
<br />
<strong>       To list all files using any protocol on any port of mace.cc.purdue.edu (cc.purdue.edu is the default domain), use:</strong><br />
<br />
<span style="color: Blue">             # lsof -i @mace</span><br />
<br />
<strong>       To list all open files for login name āāabeāā, or user ID 1234, or process 456, or process 123, or process 789, use:</strong><br />
<span style="color: Blue"><br />
             # lsof -p 456,123,789 -u 1234,abe</span><br />
<br />
<strong>       To list all open files on device /dev/hd4, use:</strong><br />
<br />
<span style="color: Blue">             # lsof /dev/hd4<br />
</span><br />
<strong><br />
     To find the process that has /u/abe/foo open, use:</strong><br />
<br />
<span style="color: Blue">             # lsof /u/abe/foo</span><br />
<br />
<strong>       To send a SIGHUP to the processes that have /u/abe/bar open, use:</strong><br />
<br />
<span style="color: Blue">             # kill -HUP ālsof -t /u/abe/barā</span><br />
<br />
<strong>       To find any open file, including an open UNIX domain socket file, with the name /dev/log, use:</strong><br />
<br />
<span style="color: Blue">             # lsof /dev/log</span><br />
<br />
<strong> 
To find processes with open files on the NFS file system named
/nfs/mount/point whose server  is  inaccessible,  and presuming your
mount table supplies the device number for /nfs/mount/point, use:</strong><br />
<br />
<span style="color: Blue">             # lsof -b /nfs/mount/point<br />
</span><br />
<strong>       To do the preceding search with warning messages suppressed, use:</strong><br />
<br />
<span style="color: Blue">             # lsof -bw /nfs/mount/point</span><br />
<br />
<strong>       To ignore the device cache file, use:</strong><br />
<br />
<span style="color: Blue">             # lsof -Di</span><br />
<br />
<strong> 
To  obtain  PID  and command name field output for each process,
file descriptor, file device number, and file inode number for each
file of each process, use:</strong><br />
<br />
<span style="color: Blue">             # lsof -FpcfDi</span><br />
<br />
<strong> 
To list the files at descriptors 1 and 3 of every process running
the lsof command for login  ID  āāabeāā  every  10  seconds, use:</strong><br />
<span style="color: Blue"><br />
             # lsof -c lsof -a -d 1 -d 3 -u abe -r10</span><br />
<br />
<strong> 
To list the current working directory of processes running a
command that is exactly four characters long and has an  āoā or āOā in
character three, use this regular expression form of the -c c option:</strong><br />
<br />
<span style="color: Blue">             # lsof -c /^..o.$/i -a -d cwd</span><br />
<br />
 <strong>      To find an IP version 4 socket file by its associated numeric dot-form address, use:<br />
</strong><br />
<span style="color: Blue">             # lsof <a href="mailto:-i@128.210.15.17">-i@128.210.15.17</a>   </span><br />
<br />
<span style="text-decoration: underline"><strong>fuser:</strong></span><br />
</p>
<div class="quoteheader">
Quote
</div>
<div class="quote">
      # fuser -km /home 
</div>
<br />
kills all processes accessing the file system /home in any way.<br />
<br />
<div class="quoteheader">
Quote
</div>
<div class="quote">
      # if fuser -s /dev/ttyS1; then :; else something; fi 
</div>
<br />
invokes something if no other process is using /dev/ttyS1.<br />
<br />
<div class="quoteheader">
Quote
</div>
<div class="quote">
      # fuser telnet/tcp shows all processes at the (local) TELNET port.
</div>
<p>
<br />
thanx
</p>
<p>
&nbsp;
</p>
<p>
&nbsp;
</p>
<div class="post">
<strong>Some Important Command to find DDOC Attack</strong><br />
<br />
<span style="color: Blue">netstat -anp |grep 'tcp\|udp' | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -n<br />
<br />
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr<br />
<br />
netstat -ntu | grep -v TIME_WAIT | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr<br />
<br />
netstat -an | grep :80 | awk '{print $5}' | cut -f1 -d&quot;:&quot; | sort | uniq -c | sort -n</span><br />
<br />
<span style="color: Red">Thanks</span>
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
netstat Command Example<br />
<br />
# netstat –listen<br />
<br />
Display open ports and established TCP connections:<br />
<br />
# netstat -vatn<br />
<br />
For UDP port try following command:<br />
<br />
# netstat -vaun<br />
<br />
If you want to see FQDN then remove -n flag:<br />
<br />
# netstat -vat<br />
<br />
lsof Command Examples<br />
<br />
Display list of open ports<br />
<br />
# lsof -i<br />
<br />
To display all open files, use:<br />
<br />
# lsof<br />
<br />
To display all open IPv4 network files in use by the process whose PID is 9255, use:<br />
<br />
# lsof -i 4 -a -p 9255<br />
<br />
thnkx
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
list information about TCP sessions on your server (specifically SSH in this example)<br />
# lsof -i tcp@`hostname`:22<br />
<br />
COMMAND  PID USER   FD   TYPE DEVICE SIZE NODE NAME<br />
sshd2   7585 root    5u  IPv4  16105       TCP localbox:ssh-&gt;your.src.ip.here:5897 (ESTABLISHED)<br />
sshd2   7653 root    5u  IPv4  16188       TCP localbox:ssh-&gt;your.src.ip.here:2262 (ESTABLISHED)<br />
<br />
list information about all TCP session<br />
# lsof -i tcp@`hostname`<br />
<br />
list information about all sockets using port 53 (will display named information on UDP/TCP)<br />
# lsof -i @`hostname`:53<br />
<br />
list information about all UDP sessions<br />
# lsof -i udp@`hostname`<br />
<br />
will list all open files with &quot;ssh&quot; in them<br />
# lsof -c ssh<br />
<br />
list everything but with UIDs insted of the UID name from /etc/passwd<br />
# lsof -l<br />
<br />
list all open files with &quot;ssh&quot; and only the UIDs<br />
# lsof -l -c ssh<br />
<br />
list
all open files for the /tmp dir (very slow), but good for finding that
nasty process that's holding a file open (although:  fuser -m /tmp,
will do the same thing)<br />
# lsof +D /tmp <br />
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
 
</div>
<div class="post">
** lsof is also the Linux/Unix command with the most switches. It has so many it has to use both pluses and minuses.<br />
<br />
<strong>Show all connections with -i</strong><br />
lsof -i <br />
<strong><br />
Show all connections with -i</strong><br />
lsof -i<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
COMMAND  PID USER   FD   TYPE DEVICE SIZE NODE NAME<br />
dhcpcd 6061 root 4u IPv4 4510 UDP *:bootpc<br />
sshd 7703 root 3u IPv6  6499 TCP *:ssh (LISTEN)<br />
sshd 7892 root 3u IPv6  6757 TCP 10.10.1.5:ssh-&gt;192.168.1.5:49901 (ESTABLISHED)
</div>
<br />
<strong>Show only TCP (works the same for UDP)</strong><br />
lsof -iTCP<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
COMMAND  PID USER   FD   TYPE DEVICE SIZE NODE NAME<br />
sshd 7703 root 3u IPv6 6499 TCP *:ssh (LISTEN)<br />
sshd 7892 root 3u IPv6 6757 TCP 10.10.1.5:ssh-&gt;192.168.1.5:49901 (ESTABLISHED)
</div>
<br />
<strong>-i :port shows all networking related to a given port</strong><br />
lsof -i :22<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
COMMAND  PID USER   FD   TYPE DEVICE SIZE NODE NAME<br />
sshd 7703 root 3u  IPv6 6499 TCP *:ssh (LISTEN)<br />
sshd 7892 root 3u  IPv6 6757 TCP 10.10.1.5:ssh-&gt;192.168.1.5:49901 (ESTABLISHED)
</div>
<strong><br />
To show connections to a specific host, use @host</strong><br />
lsof <a href="mailto:-i@192.168.1.5">-i@192.168.1.5</a><br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
sshd 7892 root 3u IPv6 6757 TCP 10.10.1.5:ssh-&gt;192.168.1.5:49901 (ESTABLISHED)
</div>
<br />
<br />
<strong>Show connections based on the host and the port using @host:port</strong><br />
lsof -i@192.168.1.5:22<br />
<div class="codeheader">
Code:
</div>
<div class="code">
sshd 7892 root 3u IPv6 6757 TCP 10.10.1.5:ssh-&gt;192.168.1.5:49901 (ESTABLISHED)
</div>
<br />
<strong>Grepping for &quot;LISTEN&quot; shows what ports your system is waiting for connections on</strong><br />
lsof -i| grep LISTEN<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
iTunes     400 daniel   16u  IPv4 0x4575228  0t0 TCP *:daap (LISTEN)
</div>
<br />
<strong>Grepping for &quot;ESTABLISHED&quot; shows current active connections</strong><br />
lsof -i| grep ESTABLISHED<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
firefox-b 169 daniel  49u IPv4 0t0 TCP 1.2.3.3:1863-&gt;1.2.3.4:http (ESTABLISHED)
</div>
<br />
<br />
<strong>You can also get information on various users, processes, and files on your system using lsof:<br />
Show what a given user has open using -u</strong><br />
lsof -u daniel<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
-- snipped --<br />
Dock 155 daniel  txt REG   14,2   2798436   823208 /usr/lib/libicucore.A.dylib<br />
Dock 155 daniel  txt REG   14,2   1580212   823126 /usr/lib/libobjc.A.dylib<br />
Dock 155 daniel  txt REG   14,2   2934184   823498 /usr/lib/libstdc++.6.0.4.dylib<br />
Dock 155 daniel  txt REG   14,2    132008   823505 /usr/lib/libgcc_s.1.dylib<br />
Dock 155 daniel  txt REG   14,2    212160   823214 /usr/lib/libauto.dylib<br />
-- snipped --
</div>
<strong><br />
See what files and network connections a command is using with -c</strong><br />
lsof -c syslog-ng<br />
<div class="codeheader">
Code:
</div>
<div class="code">
COMMAND    PID USER   FD   TYPE     DEVICE    SIZE       NODE NAME<br />
syslog-ng 7547 root  cwd    DIR    3,3    4096   2 /<br />
syslog-ng 7547 root  rtd    DIR    3,3    4096   2 /<br />
syslog-ng 7547 root  txt    REG    3,3  113524  1064970 /usr/sbin/syslog-ng<br />
syslog-ng 7547 root  mem    REG    0,0   0 [heap] <br />
syslog-ng 7547 root  mem    REG    3,3  105435   850412 /lib/libpthread-2.4.so<br />
syslog-ng 7547 root  mem    REG    3,3 1197180   850396 /lib/libc-2.4.so<br />
syslog-ng 7547 root  mem    REG    3,3   59868   850413 /lib/libresolv-2.4.so<br />
syslog-ng 7547 root  mem    REG    3,3   72784   850404 /lib/libnsl-2.4.so<br />
syslog-ng 7547 root  mem    REG    3,3   32040   850414 /lib/librt-2.4.so<br />
syslog-ng 7547 root  mem    REG    3,3  126163   850385 /lib/ld-2.4.so<br />
-- snipped --
</div>
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
Pointing to a file shows what's interacting with that file
</div>
lsof /var/log/messages<br />
<div class="codeheader">
Code:
</div>
<div class="code">
COMMAND    PID USER   FD   TYPE DEVICE   SIZE   NODE NAME<br />
syslog-ng 7547 root    4w   REG    3,3 217309 834024 /var/log/messages
</div>
<br />
<strong>The -p switch lets you see what a given process ID has open, which is good for learning more about unknown processes</strong><br />
lsof -p 10075<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
-- snipped --<br />
sshd    10068 root  mem    REG    3,3   34808 850407 /lib/libnss_files-2.4.so<br />
sshd    10068 root  mem    REG    3,3   34924 850409 /lib/libnss_nis-2.4.so<br />
sshd    10068 root  mem    REG    3,3   26596 850405 /lib/libnss_compat-2.4.so<br />
sshd    10068 root  mem    REG    3,3  200152 509940 /usr/lib/libssl.so.0.9.7<br />
sshd    10068 root  mem    REG    3,3   46216 510014 /usr/lib/liblber-2.3<br />
sshd    10068 root  mem    REG    3,3   59868 850413 /lib/libresolv-2.4.so<br />
sshd    10068 root  mem    REG    3,3 1197180 850396 /lib/libc-2.4.so<br />
sshd    10068 root  mem    REG    3,3   22168 850398 /lib/libcrypt-2.4.so<br />
sshd    10068 root  mem    REG    3,3   72784 850404 /lib/libnsl-2.4.so<br />
sshd    10068 root  mem    REG    3,3   70632 850417 /lib/libz.so.1.2.3<br />
sshd    10068 root  mem    REG    3,3    9992 850416 /lib/libutil-2.4.so<br />
-- snipped --<br />
</div>
<br />
<strong><br />
The -t option returns just a PID</strong><br />
lsof -t -c Mail<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
350<br />
</div>
<br />
ps aux | grep Mail<br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
daniel 350 0.0 1.5 405980 31452 ?? S  Mon07PM 2:50.28 /Applications/Mail.app
</div>
<br />
<br />
<br />
<span style="text-decoration: underline"><strong>Advanced Usage</strong></span><br />
<br />
<strong>Using-a allows you to combine search terms, so the query below says, &quot;show me everything running as daniel connected to 1.1.1.1&quot;</strong><br />
lsof -a -u daniel -i @1.1.1.1 <br />
<br />
<div class="codeheader">
Code:
</div>
<div class="code">
bkdr   1893 daniel 3u  IPv6 3456 TCP 10.10.1.10:1234-&gt;1.1.1.1:31337 (ESTABLISHED)
</div>
<br />
<strong>Using the -t and -c options together you can HUP processes</strong><br />
kill -HUP `lsof -t -c sshd`<br />
<strong><br />
You can also use the -t with -u to kill everything a user has open</strong><br />
kill -9 `lsof -t -u daniel`<br />
<br />
<strong>lsof +L1 shows you all open files that have a link count less than 1, often indicative of a cracker trying to hide something</strong><br />
lsof +L1<br />
<br />
<br />
 
</div>
