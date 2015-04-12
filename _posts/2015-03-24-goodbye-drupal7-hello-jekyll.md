---
layout: post
title: Goodbye Drupal7, Hello Jekyll
tags: [mrphp]
---
MrPHP.com.au has been unlatched from the shackles of, Drupal7, to a <strong>much nicer</strong> responsive theme using the new Twitter Bootstrap 3.

We're now powered by GitHub Pages.  That's right, no PHP on MrPHP.com.au.

<!--break-->

Don't get me wrong, <a href="http://www.drupal.org/">Drupal</a> served us well for over 10 years, providing a solid CMS which we manage content with images and other media.  The posts allowed for threaded comments, and it was reasonably easy to manage.

Problems started because pages were not very fast to load.  It made it difficult to want to post new content because we would spend a lot of time waiting for pages to load.  In addition Drupal can be fiddly.  If you want to achieve something you need several modules, and they all need configuration.  Compounded with slow page loading, tinkering with settings can become very tedious.  

The final blow was an intermittent ongoing DDOS that was occurring.  Although we could block the IPs using <a href="https://www.cloudflare.com/">CloudFlare</a>, Drupal was not able to serve pages fast enough for them to appear in the access logs.  We had to find a lighter solution.

Originally we decided to create it in flat HTML, and retire the blog.  We started looking through themes and found some amazing <a href="http://getbootstrap.com/">Bootstrap3</a> designs at <a href="http://startbootstrap.com/">Start Bootstrap</a>.  Some of their themes mentioned a Jekyll version, so we decided to visit <a href="http://jekyllrb.com/">JekyllRB</a> to find out more. 5 minutes of reading and we were hooked.

The concept is much different to Drupal.  You create your site content and templates, then Jekyll will build the HTML files.  Once this is done the HTML files can be served by any web server.  You can also set expires headers to make CloudFlare serve your page without needing to contact your server for each request.  This provides an ultra-light solution.
 
It just so happens that <a href="https://pages.github.com/">GitHub Pages</a> is powered by Jekyll, so you can run your site there for free and you can even use your own domain name.  If you use CloudFlare for DNS/CDN then you can also enable a free SSL certificate. 

Jekyll provides a tool to export from Drupal which worked very nicely. It created `.md` files containing the content of all the Drupal articles.  We reformatted them, but only to remove markup that was required in Drupal.

We were able to do "php-ish" things like including reusable files (header/footer/etc), storing data in `.yml` files to build dynamic pages and even output the current year in the copyright message. 

Not only that, but we were able to do "blog-ish" things like pagination and tags.  Unfortunately the comments are all gone with Drupal.  However all the articles are still available, and a new comment system has been implemented powered by disquss.
 
Managing content using a text editor seems much easier, and from what I have done so far is a lot more flexible.

If you haven't tried it before, give Jekyll a try for your next GitHub Pages site.  There's a great guide by <a href="http://michaelchelen.net/81fa/install-jekyll-2-ubuntu-14-04/">Michael Chelen</a> to get it up and running on Ubuntu 14.04 if you want to run it yourself or preview before pushing your changes to GitHub.  