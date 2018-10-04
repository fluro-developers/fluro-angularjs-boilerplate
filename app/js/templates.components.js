angular.module('fluro').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('admin-date-select/admin-date-select.html',
    "<div class=dateselect ng-class={open:settings.open}><div class=btn-group><a class=\"btn btn-default\" ng-class={active:settings.open} ng-click=\"settings.open = !settings.open\"><i class=\"fa fa-calendar\"></i> <span ng-bind-html=\"readable | trusted\"></span></a></div><dpiv class=popup><div class=datetime><div uib-datepicker class=datepicker datepicker-options=datePickerOptions ng-model=settings.dateModel></div></div></dpiv></div>"
  );


  $templateCache.put('admin-persona-image-replace/persona-image-replace-form.html',
    "<div><div ng-switch=settings.state><div ng-switch-default><div class=\"btn btn-default btn-file btn-sm btn-block\"><span>Upload photo</span> <input accept=image/jpeg,image/png,image/gif id=file type=file name=file></div></div><div ng-switch-when=processing><i class=\"fa fa-fw fa-spinner fa-spin\"></i> Uploading</div><div ng-switch-when=complete class=brand-success><i class=\"fa fa-fw fa-check\"></i> Photo was updated successfully</div><div ng-switch-when=error class=brand-warning><div><i class=\"fa fa-fw fa-warning\"></i> {{settings.errorMessage}}</div><a class=\"btn btn-default btn-sm\" ng-click=\"settings.state = 'form'\"><span>Back</span></a></div></div></div>"
  );


  $templateCache.put('extended-field-render/extended-field-render.html',
    "<div class=\"extended-field-render form-group\"><label ng-if=\"field.type != 'group'\">{{field.title}}</label><div field-transclude></div></div>"
  );


  $templateCache.put('extended-field-render/field-types/multiple-value.html',
    "<div ng-switch=field.type><div class=content-select ng-switch-when=reference><div class=\"content-list list-group\"><div class=\"list-group-item clearfix\" ng-repeat=\"item in model[field.key]\"><a ui-sref=viewContent({id:item._id})><div class=pull-left><img ng-if=\"item._type == 'image'\" ng-src=\"{{$root.getThumbnailUrl(item._id)}}\"> <i ng-if=\"item._type != 'image'\" class=\"fa fa-{{item._type}}\"></i> <i ng-if=\"item.definition == 'song'\" class=\"fa fa-music\" style=padding-right:10px></i> <span>{{item.title}}</span></div></a><div class=\"actions pull-right btn-group\"><a class=\"btn btn-tiny btn-xs\" ng-if=\"item.assetType == 'upload'\" target=_blank ng-href={{$root.getDownloadUrl(item._id)}}><i class=\"fa fa-download\"></i></a> <a class=\"btn btn-tiny btn-xs\" ng-if=canEdit(item) ng-click=editInModal(item)><i class=\"fa fa-edit\"></i></a></div></div></div></div><div ng-switch-default><ul><li ng-repeat=\"value in model[field.key]\">{{value}}</li></ul></div></div>"
  );


  $templateCache.put('extended-field-render/field-types/value.html',
    "<div ng-switch=field.type><div class=content-select ng-switch-when=reference><div class=\"content-list list-group\"><div class=\"list-group-item clearfix\" ng-init=\"item = model[field.key]\"><a ui-sref=viewContent({id:item._id})><div class=pull-left><img ng-if=\"item._type == 'image'\" ng-src=\"{{$root.getThumbnailUrl(item._id)}}\"> <i ng-if=\"item._type != 'image'\" class=\"fa fa-{{item._type}}\"></i> <span>{{item.title}}</span></div></a><div class=\"actions pull-right btn-group\"><a class=\"btn btn-tiny btn-xs\" ng-if=\"item.assetType == 'upload'\" target=_blank ng-href={{$root.getDownloadUrl(item._id)}}><i class=\"fa fa-download\"></i></a></div></div></div></div><div ng-switch-when=date>{{model[field.key] | formatDate:'j M Y'}}</div><div ng-switch-when=image><img ng-src=\"{{$root.asset.imageUrl(item._id)}}\"></div><div ng-switch-default><div ng-bind-html=\"model[field.key] | trusted\"></div></div></div>"
  );


  $templateCache.put('fluro-filter-block/fluro-filter-block.html',
    "<div><div class=filter-block ng-class={expanded:isExpanded()} ng-if=filterItems.length><div class=filter-block-title ng-click=clicked()><i class=\"fa fa-fw fa-angle-right pull-right\" ng-class=\"{'fa-rotate-90':isExpanded()}\"></i> <span>{{ title }}</span><div class=\"small brand-primary\" style=\"padding-top: 5px\" ng-show=hasFilters()>{{getTitle()}}</div></div><div class=filter-block-options><a class=filter-block-option ng-show=hasFilters() ng-click=\"toggleFilter(); settings.expanded = false;\"><span>Any {{title}}</span></a> <a class=filter-block-option ng-click=toggleFilter(filterItem) ng-class=\"{active:isActiveFilter(filterItem), inactive:!isActiveFilter(filterItem) && hasFilters()}\" ng-repeat=\"filterItem in filterItems track by filterItem._id\"><span>{{filterItem.title}}</span></a></div></div></div>"
  );


  $templateCache.put('fluro-interaction-form/button-select/fluro-button-select.html',
    "<div id={{options.id}} class=\"button-select {{to.definition.directive}}-buttons\" ng-model=model[options.key]><a ng-repeat=\"(key, option) in to.options\" ng-class={active:contains(option.value)} class=\"btn btn-default\" id=\"{{id + '_'+ $index}}\" ng-click=toggle(option.value)><span>{{option.name}}</span><i class=\"fa fa-check\"></i></a></div>"
  );


  $templateCache.put('fluro-interaction-form/custom.html',
    "<div ng-model=model[options.key] compile-html=to.definition.template></div>"
  );


  $templateCache.put('fluro-interaction-form/date-select/fluro-date-select.html',
    "<div ng-controller=FluroDateSelectController><div class=input-group><input class=form-control datepicker-popup={{format}} ng-model=model[options.key] is-open=opened min-date=to.minDate max-date=to.maxDate datepicker-options=dateOptions date-disabled=\"disabled(date, mode)\" ng-required=to.required close-text=\"Close\"> <span class=input-group-btn><button type=button class=\"btn btn-default\" ng-click=open($event)><i class=\"fa fa-calendar\"></i></button></span></div></div>"
  );


  $templateCache.put('fluro-interaction-form/dob-select/fluro-dob-select.html',
    "<div class=fluro-interaction-dob-select><dob-select ng-model=model[options.key] hide-age=to.params.hideAge hide-dates=to.params.hideDates></dob-select></div>"
  );


  $templateCache.put('fluro-interaction-form/embedded/fluro-embedded.html',
    "<div class=fluro-embedded-form><div class=form-multi-group ng-if=\"to.definition.maximum != 1\"><div class=\"panel panel-default\" ng-init=\"fields = copyFields(); dataFields = copyDataFields(); \" ng-repeat=\"entry in model[options.key] track by $index\"><div class=\"panel-heading clearfix\"><a ng-if=canRemove() class=\"btn btn-danger btn-sm pull-right\" ng-click=\"model[options.key].splice($index, 1)\"><span>Remove {{to.label}}</span><i class=\"fa fa-times\"></i></a><h5>{{to.label}} {{$index + 1}}</h5></div><div class=panel-body><formly-form model=entry fields=fields></formly-form><formly-form model=entry.data fields=dataFields></formly-form></div></div><a class=\"btn btn-primary btn-sm\" ng-if=canAdd() ng-click=addAnother()><span>Add <span ng-if=model[options.key].length>another</span> {{to.label}}</span><i class=\"fa fa-plus\"></i></a></div><div ng-if=\"to.definition.maximum == 1 && options.key\"><formly-form model=model[options.key] fields=options.data.fields></formly-form><formly-form model=model[options.key].data fields=options.data.dataFields></formly-form></div></div>"
  );


  $templateCache.put('fluro-interaction-form/field-errors.html',
    "<div class=field-errors ng-if=\"fc.$touched && fc.$invalid\"><div ng-show=fc.$error.required class=\"alert alert-danger\" role=alert><span class=\"fa fa-exclamation\" aria-hidden=true></span> <span class=sr-only>Error:</span> {{to.label}} is required.</div><div ng-show=fc.$error.validInput class=\"alert alert-danger\" role=alert><span class=\"fa fa-exclamation\" aria-hidden=true></span> <span class=sr-only>Error:</span> <span ng-if=!to.errorMessage.length>'{{fc.$viewValue}}' is not a valid value</span> <span ng-if=to.errorMessage.length>{{to.errorMessage}}</span></div><div ng-show=fc.$error.email class=\"alert alert-danger\" role=alert><span class=\"fa fa-exclamation\" aria-hidden=true></span> <span class=sr-only>Error:</span> <span>'{{fc.$viewValue}}' is not a valid email address</span></div></div>"
  );


  $templateCache.put('fluro-interaction-form/fluro-interaction-input.html',
    "<div class=\"fluro-input form-group\" scroll-active ng-class=\"{'fluro-valid':isValid(), 'fluro-dirty':isDirty, 'fluro-invalid':!isValid()}\"><label><i class=\"fa fa-check\" ng-if=isValid()></i><i class=\"fa fa-exclamation\" ng-if=!isValid()></i><span>{{field.title}}</span></label><div class=\"error-message help-block\"><span ng-if=field.errorMessage>{{field.errorMessage}}</span> <span ng-if=!field.errorMessage>Please provide valid input for this field</span></div><span class=help-block ng-if=\"field.description && field.type != 'boolean'\">{{field.description}}</span><div class=fluro-input-wrapper></div></div>"
  );


  $templateCache.put('fluro-interaction-form/fluro-terms.html',
    "<div class=terms-checkbox><div class=checkbox><label><input type=checkbox ng-model=\"model[options.key]\"> {{to.definition.params.storeData}}</label></div></div>"
  );


  $templateCache.put('fluro-interaction-form/fluro-web-form.html',
    "<div class=fluro-interaction-form><div ng-if=!correctPermissions class=form-permission-warning><div class=\"alert alert-warning small\"><i class=\"fa fa-warning\"></i> <span>You do not have permission to post {{model.plural}}</span></div></div><div ng-if=\"promisesResolved && correctPermissions\"><div ng-if=debugMode><div class=\"btn-group btn-group-justified\"><a ng-click=\"vm.state = 'ready'\" class=\"btn btn-default\">State to ready</a> <a ng-click=\"vm.state = 'complete'\" class=\"btn btn-default\">State to complete</a> <a ng-click=reset() class=\"btn btn-default\">Reset</a></div><hr></div><div ng-show=\"vm.state != 'complete'\"><form novalidate ng-submit=vm.onSubmit()><formly-form model=vm.model fields=vm.modelFields form=vm.modelForm options=vm.options><div ng-if=model.data.recaptcha><div recaptcha-render></div></div><div class=\"form-error-summary form-client-error alert alert-warning\" ng-if=\"vm.modelForm.$invalid && !vm.modelForm.$pristine\"><div class=form-error-summary-item ng-repeat=\"field in errorList\" ng-if=field.formControl.$invalid><i class=\"fa fa-exclamation\"></i> <span ng-if=field.templateOptions.definition.errorMessage.length>{{field.templateOptions.definition.errorMessage}}</span> <span ng-if=!field.templateOptions.definition.errorMessage.length>{{field.templateOptions.label}} has not been provided.</span></div></div><div ng-switch=vm.state><div ng-switch-when=sending><a class=\"btn btn-primary\" ng-disabled=true><span>Processing</span> <i class=\"fa fa-spinner fa-spin\"></i></a></div><div ng-switch-when=error><div class=\"form-error-summary form-server-error alert alert-danger\" ng-if=processErrorMessages.length><div class=form-error-summary-item ng-repeat=\"error in processErrorMessages track by $index\"><i class=\"fa fa-exclamation\"></i> <span>Error processing your submission: {{error}}</span></div></div><button type=submit class=\"btn btn-primary\" ng-disabled=!readyToSubmit><span>Try Again</span> <i class=\"fa fa-angle-right\"></i></button></div><div ng-switch-default><button type=submit class=\"btn btn-primary\" ng-disabled=!readyToSubmit><span>{{submitLabel}}</span> <i class=\"fa fa-angle-right\"></i></button></div></div></formly-form></form></div><div ng-show=\"vm.state == 'complete'\"><div compile-html=transcludedContent></div></div></div></div>"
  );


  $templateCache.put('fluro-interaction-form/nested/fluro-nested.html',
    "<div><div class=form-multi-group ng-if=\"to.definition.maximum != 1\"><div class=\"panel panel-default\" ng-init=\"fields = copyFields()\" ng-repeat=\"entry in model[options.key] track by $index\"><div class=\"panel-heading clearfix\"><a ng-if=canRemove() class=\"btn btn-danger btn-sm pull-right\" ng-click=\"model[options.key].splice($index, 1)\"><span>Remove {{to.label}}</span><i class=\"fa fa-times\"></i></a><h5>{{to.label}} {{$index + 1}}</h5></div><div class=panel-body><formly-form model=entry fields=fields></formly-form></div></div><a class=\"btn btn-primary btn-sm\" ng-if=canAdd() ng-click=addAnother()><span>Add <span ng-if=model[options.key].length>another</span> {{to.label}}</span><i class=\"fa fa-plus\"></i></a></div><div ng-if=\"to.definition.maximum == 1 && options.key\"><formly-form model=model[options.key] fields=options.data.fields></formly-form></div></div>"
  );


  $templateCache.put('fluro-interaction-form/order-select/fluro-order-select.html',
    "<div id={{options.id}} class=fluro-order-select><div ng-if=selection.values.length><p class=help-block>Drag to reorder your choices</p></div><div class=list-group as-sortable=dragControlListeners formly-skip-ng-model-attrs-manipulator ng-model=selection.values><div class=\"list-group-item clearfix\" as-sortable-item ng-repeat=\"item in selection.values\"><div class=pull-left as-sortable-item-handle><i class=\"fa fa-arrows order-select-handle\"></i> <span class=\"order-number text-muted\">{{$index+1}}</span> <span>{{item}}</span></div><div class=\"pull-right order-select-remove\" ng-click=deselect(item)><i class=\"fa fa-times\"></i></div></div></div><div ng-if=canAddMore()><p class=help-block>Choose by selecting options below</p><select class=form-control ng-model=selectBox.item ng-change=selectUpdate()><option ng-repeat=\"(key, option) in to.options | orderBy:'value'\" ng-if=!contains(option.value) value={{option.value}}>{{option.value}}</option></select></div></div>"
  );


  $templateCache.put('fluro-interaction-form/payment/payment-method.html',
    "<hr><div class=payment-method-select><div ng-if=!settings.showOptions><h3 class=clearfix>{{selected.method.title}} <em class=\"pull-right small\" ng-click=\"settings.showOptions = !settings.showOptions\">Other payment options <i class=\"fa fa-angle-right\"></i></em></h3></div><div ng-if=settings.showOptions><h3 class=clearfix>Select payment method <em ng-click=\"settings.showOptions = false\" class=\"pull-right small\">Back <i class=\"fa fa-angle-up\"></i></em></h3><div class=\"payment-method-list list-group\"><div class=\"payment-method-list-item list-group-item\" ng-class=\"{active:method == selected.method}\" ng-click=selectMethod(method) ng-repeat=\"method in methodOptions\"><h5 class=title>{{method.title}}</h5></div></div></div><div ng-if=!settings.showOptions><div ng-if=\"selected.method.key == 'card'\"><formly-form model=model fields=options.data.fields></formly-form></div><div ng-if=\"selected.method == method && selected.method.description.length\" ng-repeat=\"method in methodOptions\"><div compile-html=method.description></div></div></div></div><hr>"
  );


  $templateCache.put('fluro-interaction-form/payment/payment-summary.html',
    "<hr><div class=payment-summary><h3>Payment details</h3><div class=form-group><div ng-if=modifications.length class=payment-running-total><div class=\"row payment-base-row\"><div class=col-xs-6><strong>Base Price</strong></div><div class=\"col-xs-3 col-xs-offset-3\">{{paymentDetails.amount / 100 | currency}}</div></div><div class=\"row text-muted\" ng-repeat=\"mod in modifications\"><div class=col-xs-6><em>{{mod.title}}</em></div><div class=\"col-xs-3 text-right\"><em>{{mod.description}}</em></div><div class=col-xs-3><em class=text-muted>{{mod.total / 100 | currency}}</em></div></div><div class=\"row payment-total-row\"><div class=col-xs-6><h4>Total</h4></div><div class=\"col-xs-3 col-xs-offset-3\"><h4>{{calculatedTotal /100 |currency}} <span class=\"text-uppercase text-muted\">{{paymentDetails.currency}}</span></h4></div></div></div><div class=payment-amount ng-if=!modifications.length>{{calculatedTotal /100 |currency}} <span class=text-uppercase>({{paymentDetails.currency}})</span></div></div></div>"
  );


  $templateCache.put('fluro-interaction-form/search-select/fluro-search-select-item.html',
    "<a class=clearfix><i class=\"fa fa-{{match.model._type}}\"></i> <span ng-bind-html=\"match.label | trusted | typeaheadHighlight:query\"></span> <span ng-if=\"match.model._type == 'event' || match.model._type == 'plan'\" class=\"small text-muted\">// {{match.model.startDate | formatDate:'jS F Y - g:ia'}}</span></a>"
  );


  $templateCache.put('fluro-interaction-form/search-select/fluro-search-select-value.html',
    "<a class=clearfix><span ng-bind-html=\"match.label | trusted | typeaheadHighlight:query\"></span></a>"
  );


  $templateCache.put('fluro-interaction-form/search-select/fluro-search-select.html',
    "<div class=fluro-search-select><div ng-if=\"to.definition.type == 'reference'\"><div class=list-group ng-if=\"multiple && selection.values.length\"><div class=list-group-item ng-repeat=\"item in selection.values\"><i class=\"fa fa-times pull-right\" ng-click=deselect(item)></i> {{item.title}}</div></div><div class=list-group ng-if=\"!multiple && selection.value\"><div class=\"list-group-item clearfix\"><i class=\"fa fa-times pull-right\" ng-click=deselect(selection.value)></i> {{selection.value.title}}</div></div><div ng-if=canAddMore()><div class=input-group><input class=form-control formly-skip-ng-model-attrs-manipulator ng-model=proposed.value typeahead-template-url=fluro-interaction-form/search-select/fluro-search-select-item.html typeahead-on-select=select($item) placeholder=Search typeahead=\"item.title for item in retrieveReferenceOptions($viewValue)\" typeahead-loading=\"search.loading\"><div class=input-group-addon ng-if=!search.loading ng-click=\"search.terms = ''\"><i class=fa ng-class=\"{'fa-search':!search.terms.length, 'fa-times':search.terms.length}\"></i></div><div class=input-group-addon ng-if=search.loading><i class=\"fa fa-spin fa-spinner\"></i></div></div></div></div><div ng-if=\"to.definition.type != 'reference'\"><div class=list-group ng-if=\"multiple && selection.values.length\"><div class=list-group-item ng-repeat=\"value in selection.values\"><i class=\"fa fa-times pull-right\" ng-click=deselect(value)></i> {{getValueLabel(value)}}</div></div><div class=list-group ng-if=\"!multiple && selection.value\"><div class=\"list-group-item clearfix\"><i class=\"fa fa-times pull-right\" ng-click=deselect(selection.value)></i> {{getValueLabel(selection.value)}}</div></div><div ng-if=canAddMore()><div class=input-group><input class=form-control formly-skip-ng-model-attrs-manipulator ng-model=proposed.value typeahead-template-url=fluro-interaction-form/search-select/fluro-search-select-value.html typeahead-on-select=select($item.value) placeholder=Search typeahead=\"item.name for item in retrieveValueOptions($viewValue)\" typeahead-loading=\"search.loading\"><div class=input-group-addon ng-if=!search.loading ng-click=\"search.terms = ''\"><i class=fa ng-class=\"{'fa-search':!search.terms.length, 'fa-times':search.terms.length}\"></i></div><div class=input-group-addon ng-if=search.loading><i class=\"fa fa-spin fa-spinner\"></i></div></div></div></div></div>"
  );


  $templateCache.put('fluro-interaction-form/value/value.html',
    "<div class=fluro-interaction-value style=display:none><pre>{{model[options.key] | json}}</pre></div>"
  );


  $templateCache.put('fluro-preloader/fluro-preloader.html',
    "<div class=\"preloader {{preloader.class}}\"><div class=preloader-bg></div><div class=preloader-fg><div class=spinner><svg version=1.1 id=loader-1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=40px height=40px viewbox=\"0 0 50 50\" style=\"enable-background:new 0 0 50 50\" xml:space=preserve><path fill=#000 d=M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z transform=\"rotate(170 25 25)\"><animatetransform attributetype=xml attributename=transform type=rotate from=\"0 25 25\" to=\"360 25 25\" dur=0.6s repeatcount=indefinite></animatetransform></path></svg></div></div></div>"
  );


  $templateCache.put('fluro-purchase-service/payment-modal.html',
    "<div class=\"panel panel-default\"><div ng-switch=settings.state><div ng-switch-when=processing class=\"panel-body text-center\"><div class=\"h1 text-center\"><i class=\"fa fa-spinner fa-spin\"></i></div></div><div ng-switch-when=error><div class=panel-heading><h3 class=panel-title>{{product.title}}</h3></div><div class=panel-body><h5>Purchase Error</h5><pre>{{settings.errorMessage | json}}</pre></div><div class=panel-footer><div class=row><div class=col-xs-6><a class=\"btn btn-default\" ng-click=\"settings.state = 'ready'\"><i class=\"fa fa-angle-left\"></i> <span>Try Again</span></a></div><div class=\"col-xs-6 text-right\"><a class=\"btn btn-default\" ng-click=$dismiss()><span>Cancel</span></a></div></div></div></div><div ng-switch-when=purchased><div class=panel-heading><h3 class=panel-title>Purchase Complete</h3></div><div class=\"panel-body text-center\"><i class=\"fa fa-check fa-3x\"></i><div class=lead>You have purchased {{product.title}}.</div></div><div class=panel-footer><a class=\"btn btn-default btn-block\" ng-click=$dismiss()><span>Ok</span></a></div></div><div ng-switch-default><div class=panel-heading><h3 class=panel-title>{{product.title}}</h3></div><div ng-if=!product.amount><div class=panel-body><p>{{product.title}} is available free.<br>Click below to add it to your library.</p></div><div class=panel-footer><div class=row><div class=col-xs-6><a class=\"btn btn-default\" ng-click=$dismiss()><span>Cancel</span></a></div><div class=\"col-xs-6 text-right\"><a ng-click=purchaseFree(product._id) class=\"btn btn-primary\"><span>Add to my library</span> <i class=\"fa fa-angle-right\"></i></a></div></div></div></div><div ng-if=product.amount><div ng-if=\"methods.length && !settings.newCard\"><div class=panel-body><div class=list-group><div class=list-group-item ng-class=\"{active:settings.selectedMethod == method}\" ng-repeat=\"method in methods track by method._id\" ng-click=\"settings.selectedMethod = method\"><i class=\"fa fa-credit-card\"></i> {{method.title}}</div><div class=list-group-item ng-click=\"settings.newCard = true\">Add another card</div></div></div><div class=panel-footer><div class=row><div class=col-xs-6><a class=\"btn btn-default\" ng-click=$dismiss()><span>Cancel</span></a></div><div class=\"col-xs-6 text-right\"><a ng-click=\"purchaseWithMethod(product._id, settings.selectedMethod)\" ng-show=settings.selectedMethod class=\"btn btn-primary\"><span>Purchase {{product.amount/100 | currency}}</span> <i class=\"fa fa-angle-right\"></i></a></div></div></div></div><div ng-if=\"!methods.length || settings.newCard\"><div class=panel-body><div class=form-group><label>Name on Card *</label><input placeholder=\"Card Name eg. (Kevin Durant)\" class=form-control ng-model=\"card.name\"></div><div class=form-group><label>Card Number *</label><input placeholder=\"Card Number eg. (0000-0000-0000-0000)\" class=form-control ng-model=\"card.number\"></div><div class=row><div class=\"form-group col-xs-4\"><label>Exp Month * <em class=\"small text-muted\">MM</em></label><input placeholder=MM class=form-control ng-model=\"card.exp_month\"></div><div class=\"form-group col-xs-4\"><label>Exp Year * <em class=\"small text-muted\">YYYY</em></label><input placeholder=YYYY class=form-control ng-model=\"card.exp_year\"></div><div class=\"form-group col-xs-4\"><label>CVC *</label><input placeholder=CVC class=form-control ng-model=\"card.cvc\"></div></div><div class=form-group><div class=checkbox><label><input type=checkbox ng-model=card.saveCard> Remember this card for next time</label></div></div></div><div class=panel-footer><div class=row><div class=col-xs-6><a class=\"btn btn-default\" ng-click=$dismiss()><span>Cancel</span></a></div><div class=\"col-xs-6 text-right\"><a ng-click=\"purchaseWithCard(product._id, card)\" class=\"btn btn-primary\"><span>Purchase {{product.amount/100 | currency}}</span> <i class=\"fa fa-angle-right\"></i></a></div></div></div></div></div></div></div></div>"
  );

}]);
