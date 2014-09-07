---
layout: post
title: Using ext5 in an ext3 environment 
categories: javascript 
comments: true
excerpt: Do you have a big ext3 frontend you can't easily migrate to ext5 but still want to use the new ext5 features like MVC or MVVM for new views? Here's a solution for you.
---

> #### Background Story
> 
> My company distributes a software that makes use of an excessive ext.js 3.4 frontend. When ext.js 4 came out we said "Oh well, we don't have the time to migrate now. We will do that later." That was kind of a mistake that often happens, because now it's even harder. The frontend is bigger, has even more custom parts and - guess what - we still don't have the time. 
>
>So we decided to come up with a different approach: Since version 4 ext.js provides a sandbox mode that allows the use of different ext.js versions on the same project by changing the ext namespace. We decided to find a way to use ext5 elements inside ext3 so we can develop new modules using the advantages of ext5 without the need of refactoring the whole frontend.

---

>#### Ext5 inside ext3? Wtf? Why?
>
>Yes,  that's a good question. In my case we had a big frontend with lots of custom classes,  all written using and extending ext.js 3.4. We want to migrate soon, but we don't have the manpower to do that at once. We need to migrate one view after another. So we decided to integrate ext5 into our ext3 environment as a first step to be able to develop new modules and views using ext5. 

---

>#### pro vs. contra
>
>If you follow this approach you will be able to use ext5 containers inside ext3 containers (like in my case an ext5 panel inside an ext3 tab panel) . It is **not possible** to really mix both together (like using ext5 buttons inside an ext3 formular). Although listening on events "cross-platform" is only possible through some workarounds. 

### Disclaimer
This approach is a workaround to be used for a short period of time and is not recommended to be used as a real solution. The only real solution can be to migrate your entire application.  But this approach can help you to migrate slowly without the need to change at once. 

### The Ext5Container.js class
The idea is simple: Create an ext3 container (let's say a panel) with a div with a unique id inside and render an ext5 container (containder/panel/...) into that div.

First you need to add the Ext5 sandbox sources to your project

{% highlight javascript %}

(function (Ext3, Ext) {
	'use strict';
 
	Ext.ns('pyriand3r.util');
 
	/**
	 * @class pyriand3r.util.Ext5Container
	 * This class provides a panel for an Ext5 application inside an Ext3.4 environment.
	 *
	 * @extends Ext.Panel
	 */
	pyriand3r.util.Ext5Container = Ext.extend('Ext.Panel', {
 
		/**
		 * Initiate panel with Ext5 container.
		 */
		initComponent: function (layout) {
			var me = this;
			this.components = {};
 
			Ext.apply(this, {
				html: '<div style="width: 100%; height: 100%;" id="' + me.getContainerId() + '"></div>'
			});
 
			pyriand3r.util.Ext5Container.superclass.initComponent.call(this);
 
			this.addListener('afterrender', function () {
					me.getContainer(layout);
				}
			);
			this.addListener('resize', function (that, adjWidth, adjHeight, rawWidth, rawHeight) {
					me.components.container.setSize(adjWidth, adjHeight);
				}
			)
		},
 
		/**
		 * @method
		 * Return the Ext5 container. Lazy
		 *
		 * @returns {*}
		 */
		getContainer: function (layout) {
			if (!Ext.isObject(this.components.container)) {
 
				this.components.container = new Ext5.container.Container({
					layout: {
						type: layout,
						align: 'stretch'
					},
					renderTo: Ext5.get(this.getContainerId())
				});
			}
			return this.components.container;
		},
 
		/**
		 * @method
		 * Return id of container-div for Ext5 application
		 *
		 * @returns {string}
		 */
		getContainerId: function () {
			return this.id + '_container';
		}
	});
}(Ext, Ext5));

{% endhighlight %}