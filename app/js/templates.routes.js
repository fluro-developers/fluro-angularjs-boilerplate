angular.module('fluro').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('routes/article/article.html',
    "<div class=article-view><div class=wrapper><h1 class=wrapper-title>{{item.title}}</h1></div><div><div compile-html=item.body></div><pre>{{item | json}}</pre></div></div>"
  );


  $templateCache.put('routes/content/view.html',
    "<div class=\"bg-white border-bottom\"><div class=wrapper-xs><div class=container-fluid><div class=text-wrap><h1><div class=pull-right><i class=\"fa fa-circle\" ng-repeat=\"realm in item.realms\" style=\"margin-left:-30px; color: {{realm.bgColor}}\"></i></div>{{item.title}}</h1><h4 class=text-muted ng-show=definition.title.length>{{definition.title}}</h4><h4 class=text-muted ng-show=!definition.title.length>{{item._type}}</h4><h4 ng-show=\"item.definition == 'song'\"><span class=text-muted>By {{item.data.artist}}</span></h4></div></div></div></div><div ng-switch=item.definition><div ng-switch-default><div class=wrapper-sm><div class=container-fluid><div class=text-wrap><div view-extended-fields item=item definition=definition></div></div></div></div></div></div>"
  );


  $templateCache.put('routes/home/home.html',
    "<div class=wrapper><div class=container><div class=text-wrap><h1 class=wrapper-title>Home</h1><div><p class=lead>{{message}}</p></div></div></div></div><div class=\"bg-white border-top\"><div class=wrapper><div class=container><div class=text-wrap ng-if=$root.user._id><h1>Hi {{$root.user.firstName}}</h1><p class=lead>You're ready to start coding!</p><p>We have included a bunch of helpful services, directives and stylesheets to get you started</p></div><div class=text-wrap ng-if=!$root.user._id ng-controller=UserLoginController><h3>Sign In As a Global User</h3><p>Sign in using your Fluro Account below, this will create a cookie for you, there are also pages for signing in as a managed user above (signup and login) most applications you create will use those endpoints instead</p><p>To sign in you will need to add <em>'http://0.0.0.0:9001'</em> as a valid origin for your application at <a href=https://admin.fluro.io/application>https://admin.fluro.io/application</a></p><form style=\"max-width: 420px\" ng-submit=login({application:!$root.staging})><div class=form-group><label>Email Address</label><input ng-model=credentials.username class=form-control placeholder=\"john@appleseed.com\"></div><div class=form-group><label>Password</label><input ng-model=credentials.password type=password class=form-control placeholder=\"Password\"></div><button class=\"btn btn-primary\"><span>Sign in</span> <i class=\"fa fa-angle-right\"></i></button></form></div></div></div></div><div class=\"bg-light border-top\"><div class=wrapper><div class=container><div class=text-wrap><div><h1>Heading One</h1><h2>Heading Two</h2><h3>Heading Three</h3><h4>Heading Four</h4><h5>Heading Five</h5><h6>Heading Six</h6></div><div><p>Nulla quis lorem ut libero malesuada feugiat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.</p><p>Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Pellentesque in ipsum id orci porta dapibus. Donec rutrum congue leo eget malesuada. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta.</p></div><hr><div><label>Primary Buttons</label><div><a class=\"btn btn-xs btn-primary\"><span>XS Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-sm btn-primary\"><span>SM Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-primary\"><span>Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-lg btn-primary\"><span>LG Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-xl btn-primary\"><span>XL Button</span> <i class=\"fa fa-angle-right\"></i></a></div></div><hr><div><label>Secondary Buttons</label><div><a class=\"btn btn-xs btn-secondary\"><span>XS Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-sm btn-secondary\"><span>SM Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-secondary\"><span>Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-lg btn-secondary\"><span>LG Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-xl btn-secondary\"><span>XL Button</span> <i class=\"fa fa-angle-right\"></i></a></div></div><hr><div><label>Default Buttons</label><div><a class=\"btn btn-xs btn-default\"><span>XS Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-sm btn-default\"><span>SM Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-default\"><span>Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-lg btn-default\"><span>LG Button</span> <i class=\"fa fa-angle-right\"></i></a> <a class=\"btn btn-xl btn-default\"><span>XL Button</span> <i class=\"fa fa-angle-right\"></i></a></div></div></div></div></div></div>"
  );


  $templateCache.put('routes/login.forgot/forgot.html',
    "<div class=wrapper><div class=container ng-switch=settings.state><div class=text-wrap-sm><div class=\"alert alert-danger\" ng-show=settings.errorMessage><i class=\"fa fa-warning\"></i> <span>{{settings.errorMessage}}</span></div><div class=text-center ng-switch-when=processing><i class=\"fa lnr lnr-sync fa-spin fa-3x\"></i><h4>Sending reset email</h4></div><div class=text-center ng-switch-when=complete><h4>Reset Email Sent</h4><p>We just sent an reset link to {{credentials.username}}. Please make sure you check your spam</p><a class=\"btn btn-primary btn-block\" ng-click=backToLogin()><span>Back to login</span></a></div><div ng-switch-default><div class=wrapper-title><h3>Forgot Password</h3><p class=help-block>Enter your email below and we'll send a link for you to reset your password</p></div><form ng-submit=sendResetToken()><div class=form-group-underline><input ng-model=credentials.username type=email name=\"credentialsEmail\"><label for=credentialsEmail><span>Email Address</span></label></div><div class=wrapper-xs><button class=\"btn btn-block btn-primary\"><span>Send reset link</span></button> <a class=\"btn btn-block btn-link\" ui-sref=login.form>Back to login</a></div></form></div></div></div></div>"
  );


  $templateCache.put('routes/login/login.form.html',
    "<div class=wrapper><div class=container ng-switch=settings.state><div class=text-wrap-sm><div class=\"alert alert-danger\" ng-show=settings.error><i class=\"fa fa-warning\"></i> <span>{{settings.error}}</span></div><div class=text-center ng-switch-when=processing><i class=\"fa lnr lnr-sync fa-spin fa-3x\"></i><h4>Signing you in</h4></div><div class=text-center ng-switch-when=complete><h4>Log in Complete</h4></div><div ng-switch-default><div class=wrapper-title><h3>Login</h3><p class=lead>Please log in to continue</p></div><form ng-submit=login()><div class=form-group-underline><input ng-model=credentials.username type=email name=\"credentialsEmail\"><label for=credentialsEmail tabindex=-1><span>Email Address</span></label></div><div class=form-group-underline><input ng-model=credentials.password type=password name=\"credentialsPassword\"><label for=credentialsPassword tabindex=-1><span>Password</span></label></div><div class=wrapper-xs><button class=\"btn btn-block btn-primary\"><span>Login</span></button> <a class=\"btn btn-block btn-default\" ng-if=!$root.applicationData.disable.signup ui-sref=signup>Create new account</a> <a class=\"btn btn-block btn-link\" ui-sref=login.forgot>Forgotten your password?</a></div></form></div></div></div></div>"
  );


  $templateCache.put('routes/myaccount/myaccount.html',
    "<div><div class=\"wrapper bg-white\"><div class=container><div class=\"text-wrap text-center text-sm-left\"><div class=row><div class=\"col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0 stacked-xs\"><div class=avatar><img preload-image aspect=100 ng-src=\"{{$root.asset.avatarUrl($root.user.persona, 'persona', {w:80, h:80, cb:$root.avatarCache.buster})}}\"></div></div><div class=\"col-xs-12 col-sm-10\"><h3 class=title>{{$root.user.firstName}} {{$root.user.lastName}}</h3><h5 class=text-muted ng-show=$root.user.email>{{$root.user.email}}</h5><h5 class=text-muted ng-hide=$root.user.email>{{$root.user.username}}</h5><div style=\"max-width: 400px; display:inline-block\"><persona-image-replace-form ng-model=$root.user.persona ng-cache=$root.avatarCache.buster></persona-image-replace-form></div></div></div></div></div></div><div class=\"btn-tabs border-top\" ng-if=\"!$root.applicationData.disable.comments || !$root.applicationData.disable.notes\"><div class=\"row row-flex\"><div class=col-xs-12><a class=btn-tab ng-class=\"{active:settings.activeTab == 'ownedPurchases'}\" ng-click=\"settings.activeTab = 'ownedPurchases'\"><span>{{ownedPurchases.length}}</span> <span>{{'Product' | reword}}<span ng-show=\"ownedPurchases.length != 1\">s</span></span></a></div><div class=col-xs-12><a class=btn-tab ng-class=\"{active:settings.activeTab == 'licensedPurchases'}\" ng-click=\"settings.activeTab = 'licensedPurchases'\"><span>{{licensedPurchases.length}}</span> <span>{{'License' | reword}}<span ng-show=\"licensedPurchases.length != 1\">s</span></span></a></div><div class=col-xs-12 ng-if=!$root.applicationData.disable.comments><a class=btn-tab ng-class=\"{active:settings.activeTab == 'comments'}\" ng-click=\"settings.activeTab = 'comments'\"><span>{{comments.length}}</span> <span>{{'Comment' | reword}}<span ng-show=\"comments.length != 1\">s</span></span></a></div><div class=col-xs-12 ng-if=!$root.applicationData.disable.notes><a class=btn-tab ng-class=\"{active:settings.activeTab == 'notes'}\" ng-click=\"settings.activeTab = 'notes'\"><span>{{notes.length}}</span> <span>{{'Note' | reword}}<span ng-show=\"notes.length != 1\">s</span></span></a></div></div></div><div ng-switch=settings.activeTab><div ng-switch-when=notes class=my-comment-list><a ui-sref={{getParentSref(note.parent)}} class=my-comment-list-item ng-repeat=\"note in uniqueNotes track by note._id\"><div class=text-wrap><strong>{{note.parent.title}}</strong> <span class=\"small text-muted\">{{note.created | formatDate:'g:ia -j M Y'}}</span></div></a></div><div ng-switch-when=comments class=my-comment-list><a ui-sref={{getParentSref(comment.parent)}} class=my-comment-list-item ng-repeat=\"comment in uniqueComments track by comment._id\"><div class=text-wrap><strong>{{comment.parent.title}}</strong> <span class=\"small text-muted\">{{comment.created | formatDate:'g:ia -j M Y'}}</span></div></a></div><div ng-switch-when=licensedPurchases class=my-comment-list><div class=my-comment-list-item ng-repeat=\"purchase in licensedPurchases track by purchase._id\"><div class=text-wrap><strong>{{purchase.title}}</strong> licensed to you from {{purchase.grantedBy}}</div></div></div><div ng-switch-default><div class=accordion ng-class=\"{expanded:expanded.purchase == purchase, 'cancelled':purchase.status == 'cancelled'}\" ng-repeat=\"purchase in ownedPurchases track by purchase._id\"><div class=accordion-title ng-click=\"toggleExpanded('purchase', purchase)\"><div class=container-fluid><div class=text-wrap><h5 class=title><i class=\"fa fa-angle-right pull-right\" ng-class=\"{'fa-rotate-90':expanded.purchase == purchase}\"></i> <span><span ng-if=purchase.amount>${{purchase.product.amount / 100 }}/{{purchase.product.frequency[0]}}</span> {{purchase.product.title}}</span></h5><div style=margin-top:5px class=small><span ng-if=purchase.expires><span ng-if=purchase.renew>Next payment</span><span ng-if=!purchase.renew>Expires</span> <span>{{purchase.expiryDate | formatDate:'j M Y'}} <span class=text-muted>({{purchase.expiryDate | timeago}})</span></span></span></div></div></div></div><div class=accordion-body ng-if=\"expanded.purchase == purchase\"><div class=container ng-switch=purchase.status><div class=text-wrap ng-switch-when=cancelled><em class=small>This purchase has been cancelled and will expire {{purchase.expiryDate | formatDate:'g:ia l j M Y'}}</em></div><div class=text-wrap ng-switch-default><div ng-if=purchase.owned><div ng-if=\"purchase.limit > 1\"><h6>Licensed to {{licensesUsed(purchase)}} of {{purchase.limit-1}}</h6><p class=help-block>Manage your license invitations below</p><div class=\"panel panel-default\"><div class=table-responsive><table class=table><tbody><tr ng-repeat=\"license in purchase.managedLicense track by license._id\"><td>{{license.firstName}}</td><td>{{license.lastName}}</td><td><em class=text-muted>{{license.username}}</em></td><td></td></tr></tbody></table></div></div><div ng-if=licensesAvailable(purchase)><h6>Invite a new user</h6><p class=help-block>To invite a new user add the details below and press 'invite'</p><div class=\"panel panel-default\"><div class=panel-body><div class=row><div class=\"form-group col-xs-12 col-sm-6\"><label>First Name</label><input class=\"form-control small\" ng-model=_proposedLicense.firstName placeholder=\"First Name\"></div><div class=\"form-group col-xs-12 col-sm-6\"><label>Last Name</label><input class=\"form-control small\" ng-model=_proposedLicense.lastName placeholder=\"Last Name\"></div><div class=\"form-group col-xs-12\"><label>Email Address</label><input type=email class=\"form-control small\" ng-model=_proposedLicense.email placeholder=\"Email Address\"></div><div class=\"form-group col-xs-12\"><a class=\"btn btn-primary\" ng-disabled=_proposedLicense.processing ng-click=sendInvite(purchase)><span>Invite</span> <i class=fa ng-class=\"{'fa-spinner fa-spin':_proposedLicense.processing, 'fa-paper-plane':!_proposedLicense.processing}\"></i></a></div></div></div></div></div></div><div ng-if=purchase.method ng-controller=PaymentMethodReplaceController><h6>Payment Method</h6><div class=\"panel panel-default\"><div class=panel-body ng-switch=settings.state><div ng-switch-default><p>{{purchase.method.title}}</p><a class=\"btn btn-primary btn-sm\" ng-click=\"settings.state = 'replace'\"><span>Change / Update</span> <i class=\"fa fa-pencil-square-o\"></i></a></div><div class=text-center ng-switch-when=processing><i class=\"fa fa-spinner fa-spin fa-2x\"></i><div>Processing</div></div><div ng-switch-when=error><h6>Error replacing payment method</h6><pre>{{settings.errorMessage | json}}</pre><a class=\"btn btn-primary\" ng-click=\"settings.state = 'replace'\"><span>Back</span></a></div><div ng-switch-when=replace><p class=help-block>Update your payment details below</p><div class=form-group><label>Name on Card *</label><input placeholder=\"Card Number eg. (Kevin Durant)\" class=form-control ng-model=\"settings.addCard.name\"></div><div class=form-group><label>Card Number *</label><input placeholder=\"Card Number eg. (0000-0000-0000-0000)\" class=form-control ng-model=\"settings.addCard.number\"></div><div class=row><div class=\"form-group col-xs-6 col-sm-4\"><label>Exp Month *<em class=\"small text-muted\">(MM)</em></label><input placeholder=MM class=form-control ng-model=\"settings.addCard.exp_month\"></div><div class=\"form-group col-xs-6 col-sm-4\"><label>Exp Year *<em class=\"small text-muted\">(YYYY)</em></label><input placeholder=YYYY class=form-control ng-model=\"settings.addCard.exp_year\"></div><div class=\"form-group col-xs-6 col-sm-4\"><label>CVC *</label><input placeholder=CVC class=form-control ng-model=\"settings.addCard.cvc\"></div></div><div ng-if=hasErrors() class=\"alert alert-warning\"><label>Please correct the following errors before continuing</label><div ng-repeat=\"error in errors\"><i class=\"fa fa-exclamation\"></i> {{error}}</div></div><div class=row><div class=col-sm-6><a class=\"btn btn-primary\" ng-disabled=invalid ng-click=\"replaceWithNewCard(purchase, settings.addCard)\"><span>Update Card</span> <i class=\"fa fa-angle-right\"></i></a></div><div class=\"col-sm-6 text-sm-right\"><a class=\"btn btn-default\" ng-click=\"settings.state = null\"><span>Cancel</span></a></div></div></div></div></div></div><div ng-if=purchase.transactions.length><h6>Payment History</h6><div class=\"panel panel-default\"><table class=\"table table-striped\"><thead><tr><td>Transaction ID</td><td>Date</td><td>Amount</td><td>Currency</td></tr></thead><tbody><tr ng-repeat=\"transaction in purchase.transactions track by transaction._id\"><td>{{transaction._id}}</td><td>{{transaction.created | formatDate:'j M Y'}}</td><td>{{transaction.amount / 100 | currency}}</td><td class=text-uppercase>{{transaction.currency}}</td></tr></tbody></table></div></div><div ng-if=purchase.expires class=border-top style=\"padding-top: 20px\"><div ng-show=\"purchase.mode == 'cancel'\"><p class=help-block>Are you sure you want to cancel {{purchase.title}}?</p><a class=\"btn btn-default btn-sm\" ng-click=\"purchase.mode = null\">No</a> <a class=\"btn btn-danger btn-sm\" ng-click=cancelSubscription(purchase)>Yes, Confirm Cancel</a></div><div ng-hide=\"purchase.mode == 'cancel'\"><a class=\"btn btn-danger btn-sm\" ng-click=\"purchase.mode = 'cancel'\">Cancel '{{purchase.title}}'</a></div></div></div></div></div></div></div></div></div></div>"
  );


  $templateCache.put('routes/reset/reset.html',
    "<div class=wrapper><div class=container ng-switch=settings.state><div class=text-wrap-sm><div class=\"alert alert-danger\" ng-show=settings.errorMessage><i class=\"fa fa-warning\"></i> <span>{{settings.errorMessage}}</span></div><div class=text-center ng-switch-when=processing><i class=\"fa lnr lnr-sync fa-spin fa-3x\"></i><h4>Signing you in</h4></div><div class=text-center ng-switch-when=complete><h4>Log in Complete</h4></div><div ng-switch-when=error><h1 class=h2>Invalid Token</h1><p>This token has already been used or has expired<br>To get a new token click the button below and instructions will be emailed to you.</p><a class=\"btn btn-primary\" ui-sref=login.forgot><span>Send new token</span><i class=\"fa fa-chevron-right\"></i></a></div><div ng-switch-default><h3 class=wrapper-title>{{'Update your details' | reword}}</h3><form ng-submit=update()><div class=row><div class=\"form-group-underline col-sm-6\"><input ng-model=\"persona.firstName\"><label><span>First Name</span></label></div><div class=\"form-group-underline col-sm-6\"><input ng-model=\"persona.lastName\"><label><span>Last Name</span></label></div></div><div class=form-group-underline><input ng-model=persona.password type=\"password\"><label><span>Type your new password</span></label></div><div class=form-group-underline><input ng-model=persona.confirmPassword type=\"password\"><label><span>Confirm new password</span></label></div><div class=wrapper-xs><button class=\"btn btn-primary\"><span>Continue</span> <i class=\"fa fa-angle-right\"></i></button></div></form></div></div></div></div>"
  );


  $templateCache.put('routes/search/search.html',
    "<div class=wrapper><div class=container><div class=text-wrap><h1 class=wrapper-title>Search</h1><div></div></div></div></div>"
  );


  $templateCache.put('routes/signup/signup.html',
    "<div class=wrapper><div class=container ng-switch=settings.state><div class=text-wrap><div class=\"alert alert-danger\" ng-show=settings.error><i class=\"fa fa-warning\"></i> <span>{{settings.error}}</span></div><div class=text-center ng-switch-when=processing><i class=\"lnr lnr-sync fa fa-spin fa-3x\"></i><h4>Creating your account</h4></div><div class=text-center ng-switch-when=complete><h4>Signup Complete</h4></div><div ng-switch-default><h3>Signup</h3><p class=lead>Create your new {{$root.applicationData.siteName}} account</p><form ng-submit=signup()><div class=row><div class=\"form-group-underline col-sm-6\"><input ng-model=credentials.firstName name=\"credentialsFirstName\"><label for=credentialsFirstName><span>First Name</span></label></div><div class=\"form-group-underline col-sm-6\"><input ng-model=credentials.lastName name=\"credentialsLastName\"><label for=credentialsLastName><span>Last Name</span></label></div></div><div class=form-group-underline><input ng-model=credentials.username name=credentialsEmail type=\"email\"><label for=credentialsEmail><span>Email Address</span></label></div><div class=form-group-underline><input ng-model=credentials.password name=credentialsPassword type=\"password\"><label for=credentialsPassword><span>Create a password</span></label></div><div class=form-group-underline><input ng-model=credentials.confirmPassword name=credentialsConfirmPassword type=\"password\"><label for=credentialsConfirmPassword><span>Confirm your password</span></label></div><div class=wrapper-xs><div class=row><div class=col-sm-5><button class=\"btn btn-primary btn-block\"><span>Create account</span></button></div><div class=\"col-sm-5 col-sm-offset-2\"><a class=\"btn btn-block btn-link\" ui-sref=login.form>Already have an account?</a></div></div></div></form></div></div></div></div>"
  );

}]);