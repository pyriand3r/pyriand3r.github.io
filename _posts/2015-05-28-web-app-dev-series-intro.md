---
layout: post
title: Creating a web application with silex and react.js
categories: javascript, php
comments: true
excerpt: Setting up an easily extensible and well scaling web app is always a pain in the a**. In this series I will blog about setting up and get running my new project 'Eidolon'. A web based photo managment tool.
---

When setting up a web application you always have to overcome many obstacles. In my opinion, the base is the most important part of an (web) application. It is really time consuming and you will end up in some dead ends, but taking time to figure out the best way to provide an extensible base will save you time and brain cells when your project is growing.

So the most time-eating part is setting up a good base, there are few tutorials (at least i have found), showing you, how to set up a backend and configure it the right way.

My new project is going to be a web based photo server for managing, sorting and sharing your private photos. In this series i will blog about the obstacles i have to overcome for this project and how i solved them. I will demonstrate my solutions in small tutorials, e.g. explaining how to set up a server side backend, enabling security and providing an easily extensible code base. Maybe this shortens the time for some people out there, trying to achieve similar things, at least pushing them in the right direction.

On the other hand i hope for some comments, advise and ideas for different approaches for my problems, to get the best out of the frameworks i use to provide a really good application.

So let's start with the specs for my project

## The specs

<blockquote class="cite">From Ancient Greek → εἴδωλον / eídōlon</br>  
“figure, representation”</blockquote>

*Eidolon* is planned to be a photo server capable to be used with an existing folder structure as well as giving the oportunity to upload images through the frontend. All images will be held in high res for downloading, but there have to be a not-so-high-res version with lowered quality for fullsize view and a thumbnail to provide fast page loading.  
You will be able to sort images by tagging them and set the privacy settings for each image. These can be fully public, so you won't need to login to see them. Also you will be able to set them private, so only allowed users will be able to see them. What a user can see can be set per image and per tag (you can release tags for a user allowing him to see all images having this particular tag).  
The main view is going to be a calendar like view simulating endless scrolling in both directions, filterable through tags. In a later version i would like to add a geo-view, showing images on a world map and provide a simple yet powerfull plugin system, allowing everyone to code their own addons and hook them easily into the main system.

As you can see, there are many different features, this app needs to have:

**server-side:**  

- user accounting
- secured API
- scanning and monitoring hard drive folder
- rescaling images
- different database objects with many-to-many relationships
- loading/saving server-configuration from/in a file 

**client-side:**  

- responsible application
- endless scroll view
    + loading in background
    + Manipulating the DOM adding and removing notes

To list only a few.

I think i aim really high with some of this features, right now not having a clue how to implement them... but... this is going to be fun!

After some research and considering my own knowledge i decided to write the server-side in PHP using the [silex](http://silex.sensiolabs.org/) microframework and the frontend as a Javascript [react.js](https://facebook.github.io/react/) site.

Silex is a microframework based on Symphony2. It is small and fast, scaling well and as it is based on (and fully compatible with) Symphony you can extend it with everything a webserver needs to have. And i have worked with it in the past so i know at least a bit about how it works and how to set up an extensible and maintainable server.

Using react.js as the frontend on the other hand is more an experiment, as i haven't worked with it yet. First i thought about using googles superheroic [angularjs](https://angularjs.org/), but a college bumped me into react.js and as a web developer always has to keep up with the latest stuff, i thought giving the new shit a try.

The whole project is open source and hosted on github (where else?). [Check out the code (if there is any so far)](https://github.com/pyriand3r/eidolon).

So how it will go on?

## The next episodes

The **first** one will describe, how to set up a basic silex application, using *ServiceProvider*s and *ControllerProvider*s to generate an easily extensible application.

In the **second** one i will try to give some intel on how i set up my react.js frontend.

In the following posts i will approach on how to set up a security layer in a silex app using the *SecurityServiceProvider*, how to set up a basic [doctrine ORM](http://www.doctrine-project.org/) configuration and how to index images in a given folder structure **and** monitor filesystem changes.

So stay tuned for the first episode and follow the development of a new great web app!