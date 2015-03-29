---
layout: post
title: Slideshow with Pause on Hover in jQuery
tags: [javascript, jquery]
redirect_from:
- /blog/slideshow-pause-hover-jquery/
- /code/slideshow-pause-hover-jquery/
- /code/slideshow-with-pause-on-hover-in-jquery/
---
I searched and I could not find something similar already out there, so here is a simple slideshow that will pause when you mouseover.  With JavaScript disabled only the contents of the div inside the slideshow will be displayed.

Multiple slideshows per page are supported.

<!--break-->

## JS

```javascript
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
```


## CSS

```css
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
```

## HTML

```html
<div id="slideshow1">
  <div>
    <a href="#1"><div style="width:100;height:100;background-color:red;"></div></a>
  </div>
  <a href="#2"><div style="width:100;height:100;background-color:green;"></div></a>
  <a href="#3"><div style="width:100;height:100;background-color:blue;"></div></a>
  <a href="#4"><div style="width:100;height:100;background-color:orange;"></div></a>
  <a href="#5"><div style="width:100;height:100;background-color:pink;"></div></a>
  <a href="#6"><div style="width:100;height:100;background-color:purple;"></div></a>
  <a href="#7"><div style="width:100;height:100;background-color:black;"></div></a>
</div>

<div id="slideshow2">
  <div>
    <a href="#1"><div style="width:250;height:250;background-color:red;"></div></a>
  </div>
  <a href="#2"><div style="width:250;height:250;background-color:green;"></div></a>
  <a href="#3"><div style="width:250;height:250;background-color:blue;"></div></a>
  <a href="#4"><div style="width:250;height:250;background-color:orange;"></div></a>
  <a href="#5"><div style="width:250;height:250;background-color:pink;"></div></a>
  <a href="#6"><div style="width:250;height:250;background-color:purple;"></div></a>
  <a href="#7"><div style="width:250;height:250;background-color:black;"></div></a>
</div>
```
