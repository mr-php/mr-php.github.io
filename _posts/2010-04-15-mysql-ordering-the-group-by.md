---
layout: post
title: MySQL Ordering the Group By
created: 1271308635
---
<p>A problem that I have faced with SQL many times is pre-ordering the GROUP BY clause.</p>

<p>When you GROUP BY, MySQL will return a set of records which I call "representing records".  These records represent the group that is selected.</p>

<p>For example select "id from test group by class" will return one "representing record" per unique value of the "class" field.  The problem with this is that you have no control over which record will represent the group.</p>

<!--break-->

<p>Lets setup an example so you can see the problem in more detail.</p>

<pre class="brush:sql">
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
</pre>


<p>Great, now we have some data that we can group.  Now I want to find the latest created records, one per class.  The records I need are 2, 4 and 6.</p>

<h2>attempt 1 - group by</h2>

<pre class="brush:sql">
select id 
from test 
group by class
</pre>

<p>incorrect - returns the earliest created (1, 3 and 5)</p>


<h2>attempt 2 - group by order by</h2>

<pre class="brush:sql">
select id 
from test 
group by class 
order by created desc
</pre>

<p>incorrect - returns the earliest created, only the final result is ordered (5, 3 and 1)</p>


<h2>attempt 3 - subselect a field</h2>

<pre class="brush:sql">
select id, class class1, (select id from test where class=class1 order by created desc limit 1) id2 
from test 
group by class
</pre>

<p>almost there - returns field id2 containing 2, 4 and 6 !</p>


<h2>attempt 4 - joining using subselects</h2>

<pre class="brush:sql">
select t2.id 
from test t1 
left join test t2 on t2.id = (select id from test where class=t1.class order by created desc limit 1) 
group by t1.class
</pre>

<p>successs - returns representing record in table t2 containing 2, 4 and 6 !</p>
