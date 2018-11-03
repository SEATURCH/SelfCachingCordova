function initDtoTemplate() {

    ko.bindingHandlers.dtoTemplate = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var observable = valueAccessor();
            var data = ko.unwrap(observable);
            var template = "#" + ko.unwrap(data.DtoTypeName) + "Template";
            $(element).append($(template).html());

            var childBindingContext = bindingContext.createChildContext(data);
            ko.applyBindingsToDescendants(childBindingContext, element);

            return { controlsDescendantBindings: true };
        }
    }

    ko.bindingHandlers.editControl = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            return controlDisplay(element, valueAccessor, allBindings, viewModel, bindingContext, true);
        }
    }



    ko.bindingHandlers.displayControl = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            return controlDisplay(element, valueAccessor, allBindings, viewModel, bindingContext, false);
        }
    };

    function controlDisplay(element, valueAccessor, allBindings, viewModel, bindingContext, isEdit) {
        var observable = valueAccessor();

        var xxx = ko.unwrap(observable);

        var observableName = String(valueAccessor).split("return")[1].split(' ')[1];
        var observablePath = observableName.split('.');
        if (observablePath.length > 1) {
            observableName = observablePath.pop();
            observablePath.forEach(function (item) {
                viewModel = viewModel[item];
            });
        }

        var propertyName = observableName;
        var definitions = ko.unwrap(bindingContext.$root.definitions);
        var type = viewModel.DtoTypeName;
        var lookups = bindingContext.$root.lookups;
        var hint = allBindings().hint;

        var controlVm = {
            value: viewModel[propertyName + (isEdit ? editable.extension : '')],
            parent: viewModel,
            validationErrorMsg: ko.unwrap(viewModel.validation) ? viewModel.validation.validationErrors[propertyName] : null,
            hint: hint
        };
        controlVm.dismiss = function () { if (this.validationErrorMsg) this.validationErrorMsg(null); };
        controlVm.validate = function () { if (this.validationErrorMsg) ko.unwrap(this.parent.validation).validateProperty(propertyName); };

        var property;
        $.each(viewModel.info.config, function (index, item) {
            if (item.Name == propertyName) property = item;
        });
        var templateId;
        if (lookups[property.Options]) {
            //select
            templateId = 'select-template';
            controlVm.optionsValue = ko.unwrap(allBindings().optionsValue) || 'Key';
            controlVm.optionsText = ko.unwrap(allBindings().optionsText) || 'Value';
            controlVm.optionsDisplayText = ko.unwrap(allBindings().optionsDisplayText) || controlVm.optionsText;
            controlVm.optionsCaption = hint;
            controlVm.options = lookups[property.Options];
        } else if (property.Type == 'String') {
            templateId = 'text-template';
        } else if (property.Type == 'DateTime') {
            templateId = 'date-template';
        }
        else if (property.Type == 'Boolean') {
            templateId = 'boolean-template';
        } else {
            templateId = 'number-template';
        }

        if (!isEdit)
            templateId = 'display-' + templateId;

        $(element).append(document.getElementById(templateId).innerHTML);

        var childBindingContext = bindingContext.createChildContext(controlVm);
        ko.applyBindingsToDescendants(childBindingContext, element);

        return { controlsDescendantBindings: true };
    }



    ko.bindingHandlers.btnOptions = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var observable = valueAccessor();
            var valueObservable = allBindings().value;
            var valueAllowUnset = ko.unwrap(allBindings().valueAllowUnset);
            var value = ko.unwrap(valueObservable);
            var options = ko.unwrap(observable);

            if (!valueAllowUnset && value == null && viewModel.hint == null && options && options.length > 0) {
                var firstOptionValue = ko.utils.optionsValue(options[0], viewModel);
                valueObservable(firstOptionValue);
            }
            valueObservable.subscribe(function (newValue) {
                $(element).change();
            });

            var displayText = null;
            $(element).attr('data-toggle', 'dropdown');
            var menu = $(document.getElementById('dropdown-menu-template').innerHTML);

            $(element).append('<div class="dropdown-toggle-content" data-bind="text: ko.utils.getDropdownDisplay($data),css: {\'dropdown-unselected\': ko.unwrap(value) == null}"></div>')

            ko.applyBindings(viewModel, menu.get(0));
            $(menu).insertAfter(element);
            $(element).dropdown();
        }
    };

    ko.utils.optionsText = function (item, viewModel, isDisplay) {
        var text = isDisplay ? ko.unwrap(viewModel.optionsDisplayText) : ko.unwrap(viewModel.optionsText);
        if ($.isFunction(text)) return text(item);
        else return item[text];
    }

    ko.utils.getOptionsDisplay = function (viewModel) {
        var options = ko.unwrap(viewModel.options);
        var selectedItem = null;
        var value = ko.unwrap(viewModel.value)
        if (value == null || value == '') return null;
        options.forEach(function (item) {
            if (ko.utils.optionsValue(item, viewModel) == value) selectedItem = item;
        });
        return ko.utils.optionsText(selectedItem, viewModel, true);
    }

    ko.utils.getDropdownDisplay = function (viewModel) {
        var options = ko.unwrap(viewModel.options);
        var selectedItem = null;
        var value = ko.unwrap(viewModel.value)
        if (value == null || value == '') return ko.unwrap(viewModel.optionsCaption);
        return ko.utils.getOptionsDisplay(viewModel);
    }

    ko.utils.setOptionsValue = function (item, viewModel) {
        if (item == null)
            viewModel.value(null);
        else
            viewModel.value(ko.utils.optionsValue(item, viewModel));
    }

    ko.utils.optionsValue = function (item, viewModel) {
        var optionsValue = ko.unwrap(viewModel.optionsValue);
        if (optionsValue == null) return item;
        else return item[optionsValue];
    }

    ko.bindingHandlers.expander = {
        init: function (element, valueAccessor, allBindingsAccessor, data, context) {
            var targetSelector = ko.unwrap(valueAccessor());
            $(element).attr('data-toggle', 'collapse');
            $(element).attr('data-target', targetSelector);
            $(element).append('<span class="expander-indicator font-icon">></span>');
            $(element).click(function () {
                var target = $(targetSelector);
                if (!$(target).hasClass('collapse')) {
                    $(target).addClass('collapse show');
                    window.setTimeout(function () {
                        $(target).collapse('hide');
                    }, 0);
                } else {
                    $(target).collapse('toggle');

                }
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, data, context) {
            //  $(target).collapse();
        }
    }

    ko.bindingHandlers.expanded = {
        init: function (element, valueAccessor, allBindingsAccessor, data, bindingContext) {
            var observable = valueAccessor();
            var expanded = ko.unwrap(observable);
            if (expanded)
                $(element).addClass('collapse show');
            else
                $(element).addClass('collapse');
        },
        update: function (element, valueAccessor, allBindingsAccessor, data, bindingContext) {
            var observable = valueAccessor();
            var expanded = ko.unwrap(observable);
            if (expanded)
                $(element).collapse('show');
            else
                $(element).collapse('hide');
        }
    }

    ko.bindingHandlers.imageList = {
        init: function (element, valueAccessor, allBindingsAccessor, data, bindingContext) {
            var observable = valueAccessor();
            var value = ko.unwrap(observable);
            var childBindingContext = ko.utils.extend(bindingContext, {
                selectedImage: ko.observable(),
                images: observable
            });
            //if (value.constructor.name == 'thumbnailsVm') {
            //    childBindingContext = value;
            //    vm = value;
            //} else {
            //    vm = new thumbnailsVm();               
            //   childBindingContext = bindingContext.createChildContext(vm);
            //}
            var templateHtml = document.getElementById('image-viewer-template').innerHTML;
            childBindingContext.selectedImage.subscribe(function (newValue) {
                if (newValue) {
                    $('body').append(templateHtml);
                    $('#image-viewer-img').attr('src', ko.unwrap(newValue.url));
                    ko.applyBindings(newValue, $('#image-viewer')[0]);
                    $('#image-viewer').click(function (e) {
                        if (e.target.tagName !== 'IMG')
                            childBindingContext.selectedImage(null);
                    });
                } else {
                    document.getElementById("image-viewer-container").outerHTML = '';
                }
            });

            $(element).addClass('dto-image-thumbnails');
            $(element).append(document.getElementById('img-thumbnail-template').innerHTML);



            ko.applyBindingsToDescendants(bindingContext, element);
            return { controlsDescendantBindings: true };
        }
    }






    ko.bindingHandlers.modal = {
        init: function (element, valueAccessor, allBindings, data, context) {
            if ($("#webModal").length == 0) $('body').append($('#modal-body').html());
        },
        update: function (element, valueAccessor, allBindings, data, context) {
            var template = valueAccessor();
            var viewmodel = ko.unwrap(allBindings().modalVm);
            var onOpen = ko.unwrap(allBindings().onOpen);
            var staticModal = ko.unwrap(allBindings().static) || false;


            var webModal = $("#webModal");
            var content = $(document.getElementById("webModalContent"));

            $(element).bind("click", function () {
                ko.cleanNode(webModal[0])
                content.empty();
                content.append($('#' + template).html());
               
                var innerBindingContext = viewmodel ? context.createChildContext(viewmodel) : context;

                ko.utils.extend(innerBindingContext, {
                    closeModal: function (condition) {
                        if (condition)
                            webModal.modal('hide');
                    }
                });

                if ($.isFunction(onOpen))
                    onOpen(context.$data);
                ko.applyBindingsToDescendants(innerBindingContext, webModal[0]);
                webModal.modal({
                    backdrop: staticModal ? 'static' : true,
                    keyboard: !staticModal
                });
            });
        }
    };



    ko.bindingHandlers.swipableTabs = {
        init: function (element, valueAccessor, allBindings, data, bindingContext) {
            var data = valueAccessor();
            //var swipeTemplate = allBindings().te;
            //$(element).addClass("swipe");
            // $(element).attr("id", swipeTemplate);
            // var template = "#" + swipeTemplate;
            //$(element).append($("#" + swipeTemplate).html());
            var lastItem = data.length ? data[data.length - 1] : null;

            var vm = {};
            vm.items = data;
            vm.currentPage = ko.observable(0);
            vm.afterRender = function (array, item) {
                if (item == lastItem) {
                    window.mySwipe = new Swipe($(element).find('.swipe')[0], {
                        startSlide: 0,
                        speed: 150,
                        // auto: 3000,
                        draggable: true,
                        autoRestart: false,
                        continuous: false,
                        // disableScroll: true,
                        stopPropagation: true,
                        callback: function (index, element) { },
                        transitionEnd: function (index, element) { vm.currentPage(index); }
                    });
                }
            };
            var childBindingContext = bindingContext.createChildContext(vm);
            ko.applyBindingsToDescendants(childBindingContext, element);

            return { controlsDescendantBindings: true };

        }
    };

    ko.bindingHandlers.fadeVisible = {
        init: function (element, valueAccessor, allBindings, data, bindingContext) {
            var observable = valueAccessor();
            var value = ko.unwrap(observable);
            $(element).addClass('fade-visible');
            if (!value) {
                $(element).addClass('hidden');
                $(element).hide();
            }
        },
        update: function (element, valueAccessor, allBindings, data, bindingContext) {
            var observable = valueAccessor();
            var value = ko.unwrap(observable);
            if (value) {
                $(element).show();
                window.setTimeout(function () {
                    $(element).removeClass('hidden');
                }, 0);
            } else {
                $(element).addClass('hidden');
                window.setTimeout(function () {
                    $(element).hide();
                }, 200);
            }
        }
    }
};