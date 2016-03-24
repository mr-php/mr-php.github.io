---
layout: post
title: Image Cache using phpThumb and Mod_Rewrite
github_url: https://github.com/cornernote/php-image-cache
tags: [php, performance]
redirect_from:
- /blog/image-cache-using-phpthumb-and-modrewrite/
- /blog/image-cache-using-phpthumb-and-mod-rewrite/
- /code/image-cache-using-phpthumb-and-modrewrite/
- /code/image-cache-using-phpthumb-and-mod_rewrite/
---
Generate thumbs by visiting a URL such as `your.com/thumbs/50x50/images/image.jpg`.  This will create a 50x50px thumbnail of `your.com/images/image.jpg`.

The thumb will be stored on your server at `your.com/thumbs/50x50/images/image.jpg` so the next request for the same image will be loaded without loading php for ultra fast image cache.

<!--break-->

<h2>Introduction</h2>

About a year ago I came across a fantastic script called phpThumb.  It is an open source project used to resize images.  Sure you can do the same thing with tools such as GD2 or imagemagick (or magickwand), however its much nicer to not have to worry about those things and just focus on getting the right image with ease.

It was as easy as

```html
<img src="/phpthumb/phpThumb.php?src=myimage.jpg&w=100&h=100">
```

The problems started to arise on high-volume servers when apache had to get PHP to parse the phpThumb code for every image requested.  Sure it has caching but it still has to load PHP to decide if it should use the cache or not.

In the past I have seen this issue solved using <a href="http://httpd.apache.org/docs/current/mod/mod_rewrite.html">mod_rewrite</a> to redirect non-existent images to a script where they can be generated.  As a proof-of-concept I will provide the basic information required to get this running.

<h2>What you need</h2>
<ul>
<li>Apache</li>
<li>mod_rewrite</li>
<li>PHP</li>
</ul>

These things usually come with dedicated and shared hosting servers by default, however installation is beyond the scope of this article.

<h2>Ok, just tell me how to do it!</h2>

<h3>Upload phpThumb</h3>

Download phpThumb from here:
<a href="http://phpthumb.sourceforge.net/">http://phpthumb.sourceforge.net/</a>

Upload phpThumb to `yoursite.com/phpthumb`


