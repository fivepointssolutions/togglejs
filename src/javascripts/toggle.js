// namespace object
var Toggle = {
  
  DefaultEffect: 'slide',
  DefaultEffectDuration: 0.25,
  
  // Utility function. Returns everything after the first "#" character in a
  // string. Used to extract an anchor from a URL.
  extractAnchor: function(string) {
    var matches = String(string).match(/\#(.+)$/);
    if (matches) return matches[1];
  },
  
  // Utility function. Returns the associated toggle elements in a string. For
  // string "toggle[one,two,three]" it will return the elements with IDs of
  // "one", "two", and "three".
  extractToggleObjects: function(string) {
    var matches = String(string).match(/^toggle\[(.+)\]$/);
    if (matches) {
      var ids = matches[1].split(',');
      var elements = [];
      ids.each(function(id) { elements.push($(id)) });
      return elements;
    } else {
      return [];
    }
  },
  
  // Utility function. Wraps Effect.toggle(), but adds one additional effect:
  // "none". When "none" is specified, Element.toggle() is called instead.
  toggle: function(element, effect, options) {
    var element = $(element);
    var options = options || {};
    options.duration = options.duration || Toggle.DefaultEffectDuration
    if (effect == 'none') {
      element.toggle();
      if (options.afterFinish) options.afterFinish();
    } else {
      Effect.toggle(element, effect, options);
    }
  },
  
  // Utility function. Toggles an element with effect and options, but only if
  // it is *not* visible.
  show: function(element, effect, options) {
    var element = $(element);
    if (!element.visible()) {
      Toggle.toggle(element, effect, options);
    }
  },
  
  // Utility function. Toggles an element with effect and options, but only
  // if it *is* visible.
  hide: function(element, effect, options) {
    var element = $(element);
    if (element.visible()) {
      Toggle.toggle(element, effect, options)
    }
  },
  
  // Utility function. Wraps element with a div of class "toggle_wrapper"
  // unless one already exists. Returns the "toggle_wrapper" for given
  // element. This is necessary because effects only work properly on
  // elements that do not padding, borders, or margin.
  wrapElement: function(element) {
    var element = $(element);
    var parent = $(element.parentNode);
    if (parent.hasClassName('toggle_wrapper')) {
      return parent;
    } else {
      return element.wrap($div({'class': 'toggle_wrapper', 'style': 'display: none'}));
    }
  }
};

// Allows a link to toggle the display of another element. Just set the href
// of the link to the ID of the element you want to toggle ("#toggle_me").
// 
// *Options*
// 
// swap    :  When this option is set to true a link that is visible will be
//            hidden and a link that is hidden will be shown when the
//            associated element is shown (and vise-versa).
// effect  :  This option specifies the effect that should be used when
//            toggling. The default is "slide", but it can also be set to
//            "blind", "appear", or "none".
Toggle.LinkBehavior = Behavior.create({
  
  initialize: function(options) {
    var options = options || {};
    this.swap = options.swap || false;
    this.effect = options.effect || Toggle.DefaultEffect;
    
    this.toggleID = Toggle.extractAnchor(this.element.href);
    this.toggleElement = $(this.toggleID);
    this.toggleWrapper = Toggle.wrapElement(this.toggleElement);
    
    this.element.behavior = this; // a bit of a hack
    Toggle.addLink(this.toggleID, this.element)
  },
  
  onclick: function() {
    Toggle.toggle(
      this.toggleWrapper,
      this.effect,
      { afterFinish: function() { this._toggleLinkVisibility(); }.bind(this) }
    );
    return false;
  },
  
  _toggleLinkVisibility: function() {
    if (this.swap) {
      var links = Toggle.links[this.toggleID];
      links.invoke('toggle');
    }
  }
});
Toggle.links = {};
Toggle.addLink = function(id, element) {
  this.links[id] = this.links[id] || $A();
  this.links[id].push(element);
}

// Automatically toggle associated element if anchor is equal to the ID of the
// link's associated element.
Event.observe(window, 'dom:loaded', function() {
  var anchor = Toggle.extractAnchor(window.location);
  var links = Toggle.links[anchor];
  if (links) {
    var behavior = links.first().behavior;
    behavior.onclick();
  }
});

// Allows a the selection of a checkbox to toggle an element or group of
// elements on and off. Just set the <tt>rel</tt> attribute to
// "toggle[id1,id2,...]" on the checkbox.
// 
// *Options*
// 
// invert  :  When set to true the associated element is hidden when checked.
// effect  :  This option specifies the effect that should be used when
//            toggling. The default is "slide", but it can also be set to
//            "blind", "appear", or "none".
Toggle.CheckboxBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    this.invert = options.invert;
    
    this.toggleElements = Toggle.extractToggleObjects(this.element.readAttribute('rel'));
    this.toggleWrappers = this.toggleElements.map(function(e) { return Toggle.wrapElement(e) });
    
    this.effect = 'none';
    this.update();
    
    this.effect = options.effect || Toggle.DefaultEffect;
  },
  
  onclick: function(event) {
    this.update();
  },
  
  update: function() {
    var method = null;
    var formElementMethod = null;
    if (this.invert) {
      method = this.element.checked ? 'hide' : 'show';
      formElementMethod = this.element.checked ? 'disable' : 'enable';
    } else {
      method = this.element.checked ? 'show' : 'hide';
      formElementMethod = this.element.checked ? 'enable' : 'disable';
    }
    this.toggleWrappers.each(function(wrapper) {
      Toggle[method](wrapper, this.effect);
      Form.getElements(wrapper).invoke(formElementMethod);
    }.bind(this));
  }
});

// Allows a the selection of a radio button to toggle an element or group of
// elements on and off. Just set the <tt>rel</tt> attribute to
// "toggle[id1,id2,...]" on the radio button.
// 
// *Options*
// 
// invert  :  When set to true the associated element is hidden when checked.
// effect  :  This option specifies the effect that should be used when
//            toggling. The default is "slide", but it can also be set to
//            "blind", "appear", or "none".
Toggle.RadioBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    
    var groupName = this.element.readAttribute('name');
    
    this.toggleElements = Toggle.extractToggleObjects(this.element.readAttribute('rel'));
    this.toggleWrappers = this.toggleElements.map(function(e) { return Toggle.wrapElement(e) });
    
    if (groupName) {
      if (!Toggle.radioGroups[groupName]) Toggle.radioGroups[groupName] = new Toggle.RadioGroup;
      Toggle.radioGroups[groupName].addBehavior(this);
    }
    
    this.groupName = groupName;
    
    
    this.effect = "none";
    if (this.checked) {
      this.showElements();
    } else {
      this.hideElements();
    }
    this.effect = options.effect || Toggle.DefaultEffect;
  },
  
  showElements: function() {
    this.toggleWrappers.each(function(e) { Toggle.show(e, this.effect) }.bind(this));
  },
  
  hideElements: function() {
    this.toggleWrappers.each(function(e) { Toggle.hide(e, this.effect) }.bind(this));
  }
});
Toggle.RadioGroup = Class.create({
  initialize: function() {
    this.radioBehaviors = $A();
  },
  
  addBehavior: function(behavior) {
    this.radioBehaviors.push(behavior);
    behavior.element.observe('click', this.update.bind(this));
  },
  
  update: function() {
    this.radioBehaviors.each(function(behavior) {
      var radio = behavior.element;
      if (radio.checked) {
        behavior.showElements();
      } else {
        behavior.hideElements();
      }
    });
  }
});
Toggle.radioGroups = {};

// Allows you to toggle elements based on the selection of a combo box. Just
// set the <tt>rel</tt> attribute to "toggle[id1,id2,...]" on the each select
// option.
// 
// *Options*
// 
// effect  :  This option specifies the effect that should be used when
//            toggling. The default is "slide", but it can also be set to
//            "blind", "appear", or "none".
Toggle.SelectBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    
    var optionElements = this.element.select('option');
    
    // For some reason, this behavior needs to use IDs for the comparisons
    // to work correctly.
    this.toggleElementIDs = $A();
    this.toggleWrapperIDs = $A();
    this.toggleElementIDsFor = {}
    this.toggleWrapperIDsFor = {};
    
    optionElements.each(function(optionElement) {
      var elements = Toggle.extractToggleObjects(optionElement.readAttribute('rel'))
      var ids = elements.invoke('identify');
      var wrapperIDs = elements.map(function(e) { return Toggle.wrapElement(e) }).invoke('identify');
      this.toggleElementIDsFor[optionElement.identify()] = ids;
      this.toggleWrapperIDsFor[optionElement.identify()] = wrapperIDs;
      this.toggleElementIDs.push(ids);
      this.toggleWrapperIDs.push(wrapperIDs);
    }.bind(this));
    
    this.toggleElementIDs = this.toggleElementIDs.flatten().uniq();
    this.toggleWrapperIDs = this.toggleWrapperIDs.flatten().uniq()
    
    this.effect = "none";
    this.updateSelection();
    this.effect = options.effect || Toggle.DefaultEffect;
  },
  
  onchange: function(event) {
    this.updateSelection();
  },
  
  updateSelection: function() {
    var combo = this.element;
    var option = $(combo.options[combo.selectedIndex]);
    var wrapperIDs = this.toggleWrapperIDsFor[option.identify()];
    this.toggleWrapperIDs.each(function(id) {
      if (wrapperIDs.include(id)) {
        Toggle.show(id, this.effect);
      } else {
        Toggle.hide(id, this.effect);
      }
    }.bind(this));
  }
});