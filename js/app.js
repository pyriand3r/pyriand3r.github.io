(function(){
	'use strict';
	angular.module('hyde', ['ngRoute', 'ngAnimate', 'angularUtils.directives.dirDisqus'])
		.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
			$routeProvider
				.when('/', {
					templateUrl: '/home.html',
					reloadOnSearch: false
				})
				.when('/:link*', {
					templateUrl: function(params) {
						var link = params.link;
						if (link.substr(link.length - 4, link.length) != 'html') {
							link += '/index.html';
						}
						return link;
					}
				});
	        $locationProvider.hashPrefix('!');
		}])
		.directive('a', ['$location', function($location) {
			return {
				restrict: 'E',
				link: function(scope, elem, attrs) {
					elem.on('click', function(e) {
						if (attrs.href.substr(0,4) == 'http' || attrs.href.substr(0,3) == 'www') {
							return;
						} else {
							e.preventDefault();
							$location.path(attrs.href);
							scope.$apply();
						} 
					})
				}
			}
		}])
		.directive('additive', [function() {
			return {
				restrict: 'E',
				scope: {
					bgColor: '@',
					color: '@'
				},
				link: function(scope) {
					$('body').animate({
						backgroundColor: scope.bgColor,
					 	borderTopColor: scope.color
					}, 1000);

					$('#header > .title > a').animate({
					 	'color': scope.color
					});
				}
			}
		}])
		.controller('expandableCtrl', function ($scope) {
			$('.expandable').on('click', function () {
				if ($(this).hasClass('expanded')) {
					$(this).removeClass('expanded');
					$(this).animate({
						height: '29px'
					}, 500);
					
				} else {
					$('.expanded').animate({
						height: '29px'
					}, 500);
					$('.expandable').removeClass('expanded');

					$(this).addClass('expanded');

					var height = $scope.getHeight($(this));

					$(this).animate({
						height: height
					}, 500);
				}
				
			});

			$('blockquote').on('click', function () {
				console.log('clicked');
				if ($(this).hasClass('expanded')) {
					$(this).removeClass('expanded');
					$(this).animate({
						height: '13px'
					}, 500);
					
				} else {
					$(this).addClass('expanded');

					var height = $scope.getHeight($(this));

					$(this).animate({
						height: height
					}, 500);
				}
				
			});

			$scope.getHeight = function (element) {
				var clone = element.clone().css({"height": "auto"}).appendTo(".post");
				var height = clone.css("height");
				clone.remove();
				return height;
			};
		})
		.controller('rootCtrl', function ($scope, $location){
			$scope.setSearch = function (categorie) {
				$scope.$broadcast('filter', categorie);
				$location.search('filter', categorie);
			}
		})
		.controller('listCtrl', function ($scope, $routeParams) {
			$scope.$on('filter', function (event, newVal) {
				$scope.hide(newVal);
			});

			$scope.hide = function (cat) {
				$('.posts > li').removeClass('hide');

				if (!cat) {
					$('.posts > li').removeClass('hide');
					return;
				}

				var post = $('.posts > li').first();
				$scope.hideByCategorie(post, cat);

				for (var i = 0; i < $('.posts > li').length; i++) {
					post = post.next();
					$scope.hideByCategorie(post, cat);
				}
			};
			$scope.hideByCategorie = function (post, cat) {
				var first = post.find('>:first-child');
				if (!first.hasClass(cat)) {
					post.addClass('hide');
				}
			};

			if ($routeParams.filter) {
				$scope.hide($routeParams.filter);
			}
		});
}());