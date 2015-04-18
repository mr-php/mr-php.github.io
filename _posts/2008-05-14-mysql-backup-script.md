---
layout: post
title: MySQL Backup Script
tags: [mysql]
redirect_from:
- /code/mysql-backup-script/
---
Here is what I use to make a backup library of MySQL daily that will keep backups for 30 days.

<!--break-->

## MySQL Backup Script

`mysql_backup.sh`

```bash
#!/bin/sh

#
# Daily MySQL Backup
#

BACKUPDIR=/backup/mysql
BACKUPFILE=db-backup_`date +"%Y-%m-%d-%H"`.sql.gz
BACKUPDAYS=30

DBHOST=localhost
DBNAME="mysql db1 db2"
DBUSER=dbuser
DBPASS=dbpass

MYSQLDUMP=`which mysqldump`
GZIP=`which gzip`
FIND=`which find`

# latest daily backup
${MYSQLDUMP} --flush-logs -h${DBHOST} -u${DBUSER} -p${DBPASS} --databases ${DBNAME} | ${GZIP} -9 > ${BACKUPDIR}/${BACKUPFILE}
# uncomment below if you are running a master/slave and you want to create a new binlog
#${MYSQLDUMP} --flush-logs --master-data -h${DBHOST} -u${DBUSER} -p${DBPASS} --databases ${DBNAME} | ${GZIP} -9 > ${BACKUPDIR}/${BACKUPFILE}

# delete old backups
${FIND} ${BACKUPDIR} -mtime +${BACKUPDAYS} -delete -print
```

## MySQL Backup Script with MyDumper

Similar script using the <a href="http://dom.as/2009/02/03/mydumper/">super fast mysql backup script <b>mydumper</b></a> by Doomas Mituzas which will backup each table to its own compressed file using multiple threads:

```bash
#!/bin/sh

#
# Daily MySQL Backup
#

BACKUPDIR=/backup/mysql/
BACKUPFOLDER=`date +"%Y-%m-%d-%H"`
BACKUPDAYS=30

MYSQLDUMP=`which mysqldump`
MYDUMPER=/usr/local/bin/mydumper
FIND=`which find`
MKDIR=`which mkdir`

# latest daily backup
${MKDIR} ${BACKUPDIR}${BACKUPFOLDER}
${MYSQLDUMP} --no-data > ${BACKUPDIR}${BACKUPFOLDER}/_structure.sql
${MYDUMPER} -t 4 -o ${BACKUPDIR}${BACKUPFOLDER} -c

# delete old backups
${FIND} ${BACKUPDIR} -mtime +${BACKUPDAYS} -print -exec rm {} \;
```
