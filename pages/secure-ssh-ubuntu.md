---
layout: page
permalink: /pages/secure-ssh-ubuntu/
title: Secure SSH on Ubuntu
---

## Change Root Password

```
passwd
```

## Create a User

```
adduser admin
su admin
mkdir ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat > ~/.ssh/authorized_keys
* Paste the public key here, Then press ctrl-D *
exit
```

## Secure SSH access

* listen on non-standard port
* do not allow root access
* only allow key login

### Edit config

`vi /etc/ssh/sshd_config`

```
Port 55000
PermitRootLogin no
PasswordAuthentication no
```

### Restart SSHD

```
service sshd restart
```

### Update Firewall

```
ufw allow 55000/tcp
ufw delete allow 22/tcp
ufw status verbose
```
