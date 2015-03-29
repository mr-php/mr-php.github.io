---
layout: post
title: Pretty Bash Prompt
tags: [linux]
redirect_from:
- /code/pretty-bash-prompt/
---
Add this to your ~/.bash_profile to get a pretty prompt.

<!--break-->

## example 1

```
export PS1='\n\[\e[31;22m\]\d \t\e[32;0m\n\u@\[\e[32;0m\]\H:\w>'
```

EG:

```
Fri Nov 07 09:26:20
user@host:/path>
```

## example 2

```
export PS1="\[\033[1;31m\][\t]\[\033[1;34m\][\u@\H:\w]#\[\033[0;37m\] "
```

EG:

```
[10:43:59][user@host:/path]#
```
