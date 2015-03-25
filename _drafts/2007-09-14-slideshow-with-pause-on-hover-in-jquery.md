---
layout: post
title: Slideshow with Pause on Hover in jQuery
created: 1189781155
---
<p>I searched and I could not find something similar already out there, so here is a simple slideshow that will pause when you mouseover.  With JavaScript disabled only the contents of the div inside the slideshow will be displayed.</p>

<p>Multiple slideshows per page are supported.</p>
<!--break-->


<h2>JS</h2>
<pre class="brush:jscript">
var slideshow = {};

$(document).ready(function(){
  slideshowStart('#slideshow1');
  slideshowStart('#slideshow2',4000,true);
});

function slideshowStart(e,delay,random) {
  delay = (delay==null) ? 2000 : delay;
  random = (random==null) ? false : random;
  $(e).find('a').hide();

  var id = $(e).attr('id');
  slideshow[id] = {}
  slideshow[id].items = $(e).find('a');
  slideshow[id].delay = delay;
  slideshow[id].random = random;
  var s = slideshow[id];

  $(e).find('a').hover(function(){
    s.pause = true;
  },function(){
    s.pause = false;
    slideshowHide(id,$(s.items[s.i]));
  });

  slideshowShow(id);
}

function slideshowShow(id) {
  var s = slideshow[id];
  if (s.pause) return;

  if (s.random)
    s.i = Math.floor(Math.random()*s.items.length);
  else
    (s.i==null || s.i+1 >= s.items.length) ? s.i=0 : s.i++;

  $(s.items[s.i]).fadeIn('slow').animate({opacity: 1.0}, s.delay, function(){
    if (!s.pause) {
      slideshowHide(id,$(s.items[s.i]));
    }
  });
}

function slideshowHide(id,e) {
  var s = slideshow[id];
  if (s.fade) return;
  s.fade = true;
  $(e).fadeOut('slow',function(){
    s.fade = false;
    (s.pause) ? $(e).fadeIn('fast') : slideshowShow(id);
  });
}
</pre>


<h2>CSS</h2>
<pre class="brush:css">
#slideshow1 a {
  display: none;
}
#slideshow1 div a {
  display: block;
}

#slideshow2 a {
  display: none;
}
#slideshow2 div a {
  display: block;
}
</pre>

<h2>HTML</h2>
<pre class="brush:xml">
&lt;div id="slideshow1">
  &lt;div>
    &lt;a href="#1">&lt;div style="width:100;height:100;background-color:red;">&lt;/div>&lt;/a>
  &lt;/div>
  &lt;a href="#2">&lt;div style="width:100;height:100;background-color:green;">&lt;/div>&lt;/a>
  &lt;a href="#3">&lt;div style="width:100;height:100;background-color:blue;">&lt;/div>&lt;/a>
  &lt;a href="#4">&lt;div style="width:100;height:100;background-color:orange;">&lt;/div>&lt;/a>
  &lt;a href="#5">&lt;div style="width:100;height:100;background-color:pink;">&lt;/div>&lt;/a>
  &lt;a href="#6">&lt;div style="width:100;height:100;background-color:purple;">&lt;/div>&lt;/a>
  &lt;a href="#7">&lt;div style="width:100;height:100;background-color:black;">&lt;/div>&lt;/a>
&lt;/div>

&lt;div id="slideshow2">
  &lt;div>
    &lt;a href="#1">&lt;div style="width:250;height:250;background-color:red;">&lt;/div>&lt;/a>
  &lt;/div>
  &lt;a href="#2">&lt;div style="width:250;height:250;background-color:green;">&lt;/div>&lt;/a>
  &lt;a href="#3">&lt;div style="width:250;height:250;background-color:blue;">&lt;/div>&lt;/a>
  &lt;a href="#4">&lt;div style="width:250;height:250;background-color:orange;">&lt;/div>&lt;/a>
  &lt;a href="#5">&lt;div style="width:250;height:250;background-color:pink;">&lt;/div>&lt;/a>
  &lt;a href="#6">&lt;div style="width:250;height:250;background-color:purple;">&lt;/div>&lt;/a>
  &lt;a href="#7">&lt;div style="width:250;height:250;background-color:black;">&lt;/div>&lt;/a>
&lt;/div>
</pre>

<h2>demo</h2>
<a href="/files/demo/slideshow-pause-hover/index.html">click here for a demonstration</a>
