---
layout: post
title: Setting up an extensible silex app
categories: php, eidolon
comments: true
excerpt: The first part of the 'Eidolon'-Series describes, how to set up a extensible and well maintainable silex server, using the availible ProviderInterfaces.
---
# Introduction to silex
[silex](http://silex.sensiolabs.org/) is PHP microframework build on the Symfony2 framework, capable of being a "one-file-server". As a microframwork in it basic setup it really covers only the basics of a web server, but it is highly extensible. For this it makes use of the symphony modules, abstracting them away by ServiceProviders you can include into your silex application.

The documentation only covers very small, isolated code examples mainly refering the one-file-server solution. But with the use of the diverse ServiceProviders provided by the framework it is possible to create also bigger applications that are well separated and thus easy to maintain and to expand. As I could not find any simple step-by-step guide with good code examples (I prefer big examples of full classes and not only tiny pieces of code you first have to puzzle together) this article shall fill this gap by showing how to set up a basic silex app. 

# file structure