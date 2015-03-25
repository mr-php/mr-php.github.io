---
layout: post
title: Pretty Bash Prompt
created: 1226010544
---
<p>Add this to your ~/.bash_profile to get a pretty prompt.</p>

<!--break-->

<h2>example 1</h2>
<pre class="brush:bash">
export PS1='\n\[\e[31;22m\]\d \t\e[32;0m\n\u@\[\e[32;0m\]\H:\w>'
</pre>

EG:
<pre class="brush:plain">
Fri Nov 07 09:26:20
user@host:/path>
</pre>

<h2>example 2</h2>
<pre class="brush:bash">
export PS1="\[\033[1;31m\][\t]\[\033[1;34m\][\u@\H:\w]#\[\033[0;37m\] "
</pre>

EG:
<pre class="brush:plain">
[10:43:59][user@host:/path]#
</pre>
