---
layout: post
title: Using ext5 in an ext3 environment 
categories: javascript 
comments: true
excerpt: Do you have a big ext3 frontend you can't easily migrate to ext5 but still want to use the new ext5 features like MVC or MVVM for new views? Here's a solution for you.
---

>#### For Gods sake ... WHY???
> 
>Good question. Normally i would say the same. Why the hell would you want to do that? You should never ever mix two versions of a framework together into one project. But i did it, because i had to. My company distributes a software that makes use of a really huge ext.js 3.4 frontend - lots of view, custom classes etc. We need to upgrade to Ext4 or better Ext5 ... but we can not do that at once. We have to migrade one view after another. First step in this was having the ability to create new views directly in Ext5 to not produce more classes that need to be migrated. For this purpose it is okay i think, but i would **never** recommend this approach as a long time solution!

Some words before we start: This approach makes it possible to use Ext5 views inside Ext3 views. Allthough it is not possible to mix both really together: For instance you can't use an Ext5 button inside an ext3 form. But you can create whole new views making use of the advantages of Ext5 (MVC, MVVM) and place them inside a bigger Ext3 environment.

## Preparing the sources

All you need from Ext5 are the sandbox files which you can find in the builds folder. You will need the ext5-sandbox.js and the classic-sandbox theme.

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

>Second you can add an `Ext.util.Observable` object to your class (best inside the `initComponent()`). With it's `capture()` method you can 

The full class is available as a Gist: [Ext5Container.js](https://gist.github.com/pyriand3r/be5f91ee2de560a62a82)

## Using the Ext5Container class<a name="Ext5Container_use"></a>