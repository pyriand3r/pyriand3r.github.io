---
layout: post
title: Using Ext5 in an Ext3 environment 
categories: javascript 
comments: true
excerpt: In a project i needed to integrate the new version 5 of Sencha's Ext.js framework into an Ext3.4 environment. Here's how i did the trick.
---

>#### For Gods sake ... WHY???
> 
>Good question. Normally i would say the same. Why the hell would you want to do that? You should never ever mix two versions of a framework together into one project. But i did it, because i had to. 

>My company distributes a software that makes use of a really huge ext.js 3.4 frontend - lots of views, custom classes etc. We need to upgrade to Ext4 or better Ext5 ... but we can't do that at once. We have to migrade one view after another. First step in this process was having the ability to create new views directly in Ext5 to not produce more classes that need to be migrated. 

Some words before we start: This approach makes it possible to use Ext5 views inside Ext3 views. Allthough it is not possible to mix both really together: For instance you can't use an Ext5 button inside an ext3 form. But you can create whole new views making use of the advantages of Ext5 (MVC, MVVM) and place them inside a bigger Ext3 environment. To keep the example: Create a whole Ext5 form and place it inside an Ext3 popup.

**IMPORTANT**: For my purpose as a temporary arrangement this solution is okay i think, but i would **never** recommend this approach as a long time solution!

## Preparing the sources

All you need from Ext5 are the sandbox files which you can find in the build folder. You will need the *ext5-sandbox.js* and the classic-sandbox theme located under `packages/ext-theme-classic-sandbox`. This is the only working theme for the sandbox mode shipped with Ext5 as all css-classes are prefixed with `ext5-`.

## The Ext5Container class

For my wrapper class i extended an `Ext.Panel` but you can also use any other ext container that can define a `html` element, as we need this to render the Ext5 to. Furthermore we will define everything we need inside the `initComponent` of the class and add some default values with the `Ext.apply()` and `Ext.applyIf()` methods:

{% highlight javascript %}

pyriand3r.util.Ext5Container = Ext.extend(Ext.Panel, {
 
    initComponent: function () {
        var me = this;
        this.components = {};
    
        // create a containerConfig object if none was passed
        Ext.applyIf(this, {
            containerConfig: {}
        });
    
        // add a default layout
        Ext.applyIf(this.containerConfig, {
            layout: {
                type: 'fit',
                align: 'stretch'
            }
        });
    
        // set the id of the html element the ext5 container will be 
        // rendered to.
        Ext.apply(this.containerConfig, {
            renderTo: this.getContainerId()
        });
    
        // set up the ext3 classes html element to contain a fully expanded
        // div with the same id as defined for the renderTo variable of the
        // ext5 container.
        Ext.apply(this, {
            html: '<div style="width: 100%; height: 100%;" id="' + 
                me.getContainerId() + 
                '"></div>',
            items: {}
        });
    }
});

{% endhighlight %}

As we need a unique id for the div the Ext5 container should be rendered to, we have to define a `getContainerId()` method that returns this id:

{% highlight javascript %}

/**
     * @method
     * Return the id of the container-div.
     *
     * @returns {string}
     */
    getContainerId: function () {
        return this.id + '_container';
    }

{% endhighlight %}

That's an easy one: Just get the unique id of the ext3 container and add something to it, like `_container`. As easy as f...

Last thing we need to do is to get the ext5 container to render into the div. Important for this is that this can only be done after the ext3 element is rendered, because the div has to exist when we add the ext5 container to it. So we add a listener to the `afterrender` event of the ext3 container:

{% highlight javascript %}

initComponent: function () {
    
    ...

    this.addListener('afterrender', function () {
                me.getContainer();
            }
        );
    },

    /**
     * @method
     * Return the ext5 container. Lazy
     *
     * @returns {Ext5.container.Container}
     */
    getContainer: function () {
        if (!Ext.isObject(this.components.container)) {
            this.components.container = new Ext5.container.Container(this.containerConfig);
        }
        return this.components.container;
    },

    ...
}

{% endhighlight %}

>#### Reusable lazy
>The `getContainer()` method is lazy which makes it reusable to get access to the container after it has been created.

That's it on the whole. Now you can add any Ext5 view you wish to the ext5 container [as described below](#Ext5Container_use). But there still some small things to do.

First the ext5 containers dimensions won't fit because after render the ext3 component and therefore the div will not have the right dimensions (at least in my case it was the case). It will expand immediatly but this happens after the ext5 container is initialized, ending up with a unusable small ext5 container. Fortunately the ext3 parent will emit a `resize` event after it has expanded we can listen to to adjust the width and height of our ext5 container.

Second the ext5 container and the ext5 view within does not have any direct connection to the ext3 environment surrounding it. So if the ext3 container is destroyed, the ext5 won't notice and therefore the destroy-event is not forwarded to it which will end in browser memory bloated with unused ext5 class objects. To solve this issue we can add a second listener and this time we will listen to the `destroy` event of the ext3 parent and to pass it to the ext5:

{% highlight javascript %}

this.addListener('resize', function (that, adjWidth, adjHeight) {
    me.getContainer().setSize(adjWidth, adjHeight);
});

this.addListener('destroy', function () {
    me.getContainer().destroy();
});

{% endhighlight %}

>#### Passing events
>Because the Ext5 is not aware of the ext3 surrounding it, one has to listen to automated ext3 events manually and reimplement the behaviour. There are different possiblities to do so i can think of.
>
>First you can add listeners to explicit events with the `addListener()` method like we did before with the destroy and resize event.
>
>Second you can add an `Ext.util.Observable` object to your class (best inside the `initComponent()`). With it's `capture()` method you can catch **all** events an Ext object throws and react on it:
>
><div class="highlight"><pre><code class="language-javascript" data-lang=">javascript"><span class="nx">iniComponent</span><span class="o">:</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
>    
>    <span class="p">...</span>
>    
>    <span class="nx">Ext</span><span class="p">.</span><span class="nx">util</span><span class="p">.</span><span class="nx">Observable</span><span class="p">.</span><span class="nx">capture</span><span class="p">(</span><span class="nx">myObj</span><span class="p">,</span> <span class="kd">function</span><span class="p">(</span><span class="nx">evname</span><span class="p">)</span> <span class="p">{</span>
>        <span class="nx">console</span><span class="p">.</span><span class="nx">log</span><span class="p">(</span><span class="nx">evname</span><span class="p">,</span> <span class="nx">arguments</span><span class="p">);</span>
>        
>        <span class="c1">//Here you can intercept or forward the events or react to them.</span>
>    <span class="p">});</span>
><span class="p">};</span></code></pre></div>

The full class is available as a Gist: [Ext5Container.js](https://gist.github.com/pyriand3r/be5f91ee2de560a62a82)

## Using the Ext5Container class<a name="Ext5Container_use"></a>

Now that we have a wrapper class for Ext5, we can begin developing new views. To start with a clean codebase (as far as possible if you're mixing two versions of the same framework together already) i recommend creating a wrapper-container class for every main view you want to create inheriting of the Ext5Container. If you insert your main view into the created Ext5 container you can keep your code clean to use it without changes after getting rid of Ext3:

{% highlight javascript %}

(function (Ext3, Ext) {
    "use strict";

    /**
     * @class pyriander.view.MainViewCompatibilityContainer
     * The compatibility container to get a Ext5 environment inside an Ext3.4 panel.
     *
     * @extends pyriand3r.util.Ext5Container
     */
    Ext3.define('pyriander.view.MainViewCompatibilityContainer', {
        extend: 'pyriand3r.util.Ext5Container',

        /**
         * @constructor
         */
        initComponent: function () {
            var me = this;

            pyriand3r.view.CompatibilityContainer.superclass.initComponent.call(this);

            this.addListener(
                'afterrender', function () {
                    me.getContainer().add(me.getMyExt5View());
                }
            );
        },

        /**
         * @method
         * Returns an instance of the myExt5View. Lazy
         *
         * @returns {pyriand3r.view.MyExt5View}
         */
        getMyExt5View: function () {
            var me = this;
            if (!Ext.isObject(this.components.myExt5View)) {
                this.components.myExt5View = Ext.create('pyriand3r.view.MyExt5View', {
                    svid: me.svid,
                    setTabTitle: function (title) {
                        me.setTitle(title);
                    }
                });
            }
            return this.components.myExt5View;
        }
    });
}(Ext, Ext5));

{% endhighlight %}

In this example there are several things to mention:

1. First of all you can add your own view into the Ext5 container using the `afterrender` event and adding it to the container. This way you fully abstract your new views from the wrapper class allowing yourself to use the view later without modification, as soon as you got rid of the legacy Ext3.
2. In all my Ext5 classes i use a closure-function around the whole class: 
    
    <div class="highlight"><pre><code class="language-javascript" data-lang="javascript"><span class="p">(</span><span class="kd">function</span> <span class="p">(</span><span class="nx">Ext3</span><span class="p">,</span> <span class="nx">Ext</span><span class="p">)</span> <span class="p">{</span>

    <span class="p">...</span>

    <span class="p">}(</span><span class="nx">Ext</span><span class="p">,</span> <span class="nx">Ext5</span><span class="p">))</span></code></pre></div>

    This trick translates the namespaces from the two Ext version, so i can refer to the sandbox version as the normal `Ext` while the legacy version 3.4 gets the sandbox namespace Ext3. Once you get rid of the legacy version you only have to remove the closure function and everything will work fine, because you refer in all your new classes to `Ext` instead of `Ext5`.

3. If you want to interact with the Ext3 wrapper class from inside the Ext5 view you can add custom functions to your view in the config object you pass to it during creation. For instance i needed to be able to change the tab title from inside my view, so i added a function for this:

    <div class="highlight"><pre><code class="language-javascript" data-lang="javascript"><span class="k">this</span><span class="p">.</span><span class="nx">components</span><span class="p">.</span><span class="nx">myExt5View</span> <span class="o">=</span> <span class="nx">Ext</span><span class="p">.</span><span class="nx">create</span><span class="p">(</span><span class="s1">'pyriand3r.view.MyExt5View'</span><span class="p">,</span> <span class="p">{</span>
        <span class="nx">svid</span><span class="o">:</span> <span class="nx">me</span><span class="p">.</span><span class="nx">svid</span><span class="p">,</span>
        <span class="nx">setTabTitle</span><span class="o">:</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">title</span><span class="p">)</span> <span class="p">{</span>
            <span class="nx">me</span><span class="p">.</span><span class="nx">setTitle</span><span class="p">(</span><span class="nx">title</span><span class="p">);</span>
        <span class="p">}</span>
    <span class="p">});</span></code></pre></div>

That's it. I hope i could help and ... Happy coding!