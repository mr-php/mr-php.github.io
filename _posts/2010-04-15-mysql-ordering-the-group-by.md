---
layout: post
title: MySQL Ordering the Group By
tags: [mysql]
redirect_from:
- /code/mysql-ordering-the-group-by/
---
A problem that I have faced with SQL many times is pre-ordering the `GROUP BY` clause.

When you GROUP BY, MySQL will return a set of records which I call _representing records_.  These records represent the group that is selected.

For example `select id from test group by class` will return one _representing record_ per unique value of the `class` field.  The problem with this is that you have no control over which record will represent the group.

<!--break-->

Lets setup an example so you can see the problem in more detail.

```sql
#
# setup the table and some data
#
CREATE TABLE `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class` varchar(64) DEFAULT NULL,
  `created` date DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `test` VALUES 
('1', 'aaa', '2009-01-01'),
('2', 'aaa', '2009-01-02'),
('3', 'bbb', '2009-01-03'),
('4', 'bbb', '2009-01-04'),
('5', 'ccc', '2009-01-05'),
('6', 'ccc', '2009-01-06');
```


Great, now we have some data that we can group.  Now I want to find the latest created records, one per class.  The records I need are `2`, `4` and `6`.

## attempt 1 - group by

```sql
select id 
from test 
group by class
```

incorrect - returns the earliest created (`1`, `3` and `5`)


## attempt 2 - group by order by

```sql
select id 
from test 
group by class 
order by created desc
```

incorrect - returns the earliest created, only the final result is ordered (`5`, `3` and `1`)


## attempt 3 - subselect a field

```sql
select id, class class1, (select id from test where class=class1 order by created desc limit 1) id2 
from test 
group by class
```

almost there - returns field id2 containing `2`, `4` and `6` !


## attempt 4 - joining using subselects

```sql
select t2.id 
from test t1 
left join test t2 on t2.id = (select id from test where class=t1.class order by created desc limit 1) 
group by t1.class
```

Success! This returns representing record in table t2 containing `2`, `4` and `6` !
