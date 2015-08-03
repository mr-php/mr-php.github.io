---
layout: page
permalink: /pages/secure-ssh-ubuntu/
title: Secure SSH on Ubuntu
---

# Secure SSH access

* listen on non-standard port
* do not allow root access
* only allow key login

## Edit config

`vi /etc/ssh/sshd_config`

```
Port 55000
PermitRootLogin no
PasswordAuthentication no
```

## Restart SSHD

```
service sshd restart
```
