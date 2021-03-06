angular.module('fluro').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('routes/app.home/home.html',
    "<div class=flex-column><div class=flex-column-header><div class=page-header><div class=container-fluid><div class=text-wrap><div class=\"input-group search-bar\" ng-class={active:search.terms.length}><input ng-model=search.terms placeholder=\"Search for your name\" class=form-control><div class=input-group-addon ng-click=\"search.terms = ''\"><i class=far ng-class=\"{'fa-search':!search.terms.length, 'fa-times':search.terms.length}\"></i></div></div><a ng-click=\"notify('Hello')\">Click</a></div></div></div></div><div class=flex-column-body><div class=page-content><div class=container-fluid><div class=text-wrap><div ng-if=$root.user._id><h1>Hi {{$root.user.firstName}}</h1><p class=lead>You're ready to start coding!</p><p>We have included a bunch of helpful services, directives and stylesheets to get you started</p></div><div ng-if=!$root.user._id ng-controller=UserLoginController><h3>Please Sign In To Fluro</h3><p>Sign in using your Fluro Account and refresh this page, or login using the example form below this will create a cookie for you, there are also pages for signing in as a managed user above (signup and login) most applications you create will use those endpoints instead</p><p>To sign in you will need to add <em>'http://localhost:9001'</em> as a valid origin for your application at <a href=https://admin.fluro.io/application>https://admin.fluro.io/application</a></p><form style=\"max-width: 420px\" ng-submit=login({application:!$root.staging})><div class=form-group><label>Email Address</label><input ng-model=credentials.username class=form-control placeholder=\"john@appleseed.com\"></div><div class=form-group><label>Password</label><input ng-model=credentials.password type=password class=form-control placeholder=\"Password\"></div><button class=\"btn btn-primary\"><span>Sign in</span> <i class=\"fa fa-angle-right\"></i></button></form></div></div></div></div></div><div class=flex-column-footer ng-if=\"pager.total > 20\"><div class=\"page-footer text-center\">Footer</div></div></div>"
  );


  $templateCache.put('routes/app/app.html',
    "<div class=\"notifications-bar {{$root.notifications.lastMessage().style}}\" ng-class=\"{'empty':!$root.notifications.messages.length}\"><div class=notification><span>{{$root.notifications.lastMessage().text}}</span></div></div><div ui-view class=app-view></div>"
  );

}]);
