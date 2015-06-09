---
layout: post
title: Setting up an extensible silex app
categories: php, eidolon
comments: true
excerpt: The first part of the 'Eidolon'-Series describes, how to set up a extensible and well maintainable silex server, using the availible ProviderInterfaces.
---
# Introduction to silex
[silex](http://silex.sensiolabs.org/) is PHP microframework build on the Symfony2 framework, capable of being a "one-file-server". As a microframwork in it basic setup it really covers only the basics of a web server, but it is highly extensible. For this it makes use of the symphony modules, abstracting them away by ServiceProviders you can include into your silex application.