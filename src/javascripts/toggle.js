var Toggle = {
  
  DefaultEffect: 'slide',
  DefaultEffectDuration: 0.25,
  
  EffectPairs: {
    'slide' : ['SlideDown','SlideUp'],
    'blind' : ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  
  /**
   *  Toggle.extractAnchor(url) -> String
   *  
   *  Utility function. Returns everything after the first "#" character in a
   *  string. Used to extract the anchor from a URL.
  **/
  extractAnchor: function(url) {
    var matches = String(url).match(/\#(.+)$/);
    if (matches) return matches[1];
  },
  
  /**
   *  Toggle.extractToggleObjects(string) -> Array
   *  
   *  Utility function. Returns the associated toggle elements in a string. For
   *  string "toggle[one,two,three]" it will return the elements with IDs of
   *  "one", "two", and "three".
  **/
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
  
  /**
   *  Toggle.toggle(elements, effect, options)
   *  
   *  Utility function. Toggles an element or array of elements with effect
   *  and options. Similar to `Effect.toggle()`, but works with multiple
   *  elements and also supports setting effect to "none".
   *  
   *  Parameters
   *  - elements: An element or array of elements to toggle
   *  - effect: This option specifies the effect that should be used when
   *    toggling. The default is "slide", but it can also be set to
   *    "blind", "appear", or "none".
   *  - options: The standard Effect options hash with the addition of
   *    beforeToggle and afterToggle events.
  **/
  toggle: function(elements, effect, options) {
    var elements = $A([elements]).flatten();
    var effect = (effect || Toggle.DefaultEffect).toLowerCase();
    var options = options || {};
    
    if (effect == 'none') {
      if (options.beforeStart) options.beforeStart();
      elements.invoke("toggle");
      if (options.afterFinish) options.afterFinish();
    } else {
      options.duration = options.duration || Toggle.DefaultEffectDuration;
      
      var effects = elements.map(function(e) {
        var element = $(e);
        var inOrOut = element.visible() ? 1 : 0;
        var name = Toggle.EffectPairs[effect][inOrOut];
        return new Effect[name](element, { sync: true });
      });
      
      new Effect.Parallel(effects, options);
    }
  },
  
  /**
   *  Toggle.show(elements, effect, options)
   *  
   *  Utility function. Shows an element or array of elements with effect
   *  and options.
  **/
  show: function(elements, effect, options) {
    var elements = $([elements]).flatten();
    elements = elements.map(function(element) { return $(element) });
    elements = elements.reject(function(element) { return element.visible() });
    Toggle.toggle(elements, effect, options);
  },
  
  /**
   *  Toggle.hide(elements, effect, options)
   *  
   *  Utility function. Hides an element or array of elements with effect
   *  and options.
  **/
  hide: function(elements, effect, options) {
    var elements = $([elements]).flatten();
    elements = elements.map(function(element) { return $(element) });
    elements = elements.reject(function(element) { return !element.visible() });
    Toggle.toggle(elements, effect, options);
  },
  
  /**
   *  Toggle.wrapElement(element)
   *  
   *  Utility function. Wraps element with a div of class "toggle_wrapper"
   *  unless one already exists. Returns the "toggle_wrapper" for given
   *  element. This is necessary because effects only work properly on
   *  elements that do not have padding, borders, or margin.
  **/
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

/**
 * class Toggle.LinkBehavior < Behavior
 *
 *  Allows a link to toggle the display of another element or array of
 *  elements on and off. Just set the <tt>rel</tt> attribute to
 *  "toggle[id1,id2,...]" on the link and the href of the link to the
 *  ID of the first element ("#id1").
 *  
 *  Options
 *  - effect: This option specifies the effect that should be used when
 *    toggling. The default is "slide", but it can also be set to
 *    "blind", "appear", or "none".
 *  - onLoad: Called after the behavior is initialized. The function is
 *    automatically bound to the behavior (so "this" referes to the
 *    behavior).
 *  - beforeToggle: Called after the link is clicked, but before the effect is
 *    started. The link is passed as the first parameter and the
 *    function is automatically bound to the behavior (so "this"
 *    refers to the behavior).
 *  - afterToggle: Called after the effect is complete. The link is passed as
 *    the first parameter and the function is automatically bound
 *    to the behavior (so "this" refers to the behavior).
**/
Toggle.LinkBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    
    this.effect = options.effect || Toggle.DefaultEffect;
    
    this.onLoad = options.onLoad || Prototype.emptyFunction;
    this.onLoad.bind(this);
    
    this.beforeToggle = options.beforeToggle || Prototype.emptyFunction;
    this.beforeToggle.bind(this);
    
    this.afterToggle = options.afterToggle || Prototype.emptyFunction;
    this.afterToggle.bind(this);
    
    var elements = Toggle.extractToggleObjects(this.element.readAttribute('rel'));
    this.toggleWrappers = elements.map(function(e) { return Toggle.wrapElement(e) });
    
    this.toggleID = Toggle.extractAnchor(this.element.href);
    this.element.behavior = this; // a bit of a hack
    Toggle.addLink(this.toggleID, this.element);
    
    this.onLoad(this.element);
  },
  
  onclick: function() {
    this.toggle();
    return false;
  },
  
  toggle: function() {
    Toggle.toggle(
      this.toggleWrappers,
      this.effect,
      {
        beforeStart: function() { this.beforeToggle(this.element) }.bind(this),
        afterFinish: function() { this.afterToggle(this.element) }.bind(this)
      }
    );
  }
});
Toggle.links = {};
Toggle.addLink = function(id, element) {
  this.links[id] = this.links[id] || $A();
  this.links[id].push(element);
};


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

/**
 * class Toggle.CheckboxBehavior < Behavior
 *  
 *  Allows a the selection of a checkbox to toggle an element or group of
 *  elements on and off. Just set the `rel` attribute to "toggle[id1,id2,...]"
 *  on the checkbox.
 *  
 *  Options
 *  - invert: When set to true the associated element is hidden when checked.
 *  - effect: This option specifies the effect that should be used when
 *    toggling. The default is "slide", but it can also be set to
 *    "blind", "appear", or "none".
**/
Toggle.CheckboxBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    this.invert = options.invert;
    
    var elements = Toggle.extractToggleObjects(this.element.readAttribute('rel'));
    this.toggleWrappers = elements.map(function(e) { return Toggle.wrapElement(e) });
    
    this.effect = 'none';
    this.toggle();
    
    this.effect = options.effect || Toggle.DefaultEffect;
  },
  
  onclick: function(event) {
    this.toggle();
  },
  
  toggle: function() {
    var method, formElementMethod;
    
    if (this.invert) {
      method = this.element.checked ? 'hide' : 'show';
      formElementMethod = this.element.checked ? 'disable' : 'enable';
    } else {
      method = this.element.checked ? 'show' : 'hide';
      formElementMethod = this.element.checked ? 'enable' : 'disable';
    }
    
    Toggle[method](this.toggleWrappers, this.effect);
    
    // Disable/enable form elements based on whether the container is
    // visible or not.
    this.toggleWrappers.each(function(wrapper) {
      Form.getElements(wrapper).invoke(formElementMethod);
    });
  }
});

/**
 * class Toggle.RadioGroupBehavior < Behavior
 *  
 *  Allows you to toggle elements based on the selection of a group of radio
 *  buttons. Just set the <tt>rel</tt> attribute to "toggle[id1,id2,...]" on
 *  each radio button. Radio buttons must be grouped inside a containing
 *  element to which the behavior is applied.
 *  
 *  Options
 *  - effect: This option specifies the effect that should be used when
 *    toggling. The default is "slide", but it can also be set to
 *    "blind", "appear", or "none".
**/
Toggle.RadioGroupBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    
    this.radioButtons = this.element.select('input[type=radio]');
    
    this.toggleWrapperIDs = $A();
    this.toggleWrapperIDsFor = {};
    
    this.radioButtons.each(function(radioButton) {
      var elements = Toggle.extractToggleObjects(radioButton.readAttribute('rel'))
      var ids = elements.invoke('identify');
      var wrapperIDs = elements.map(function(e) { return Toggle.wrapElement(e) }).invoke('identify');
      this.toggleWrapperIDsFor[radioButton.identify()] = wrapperIDs;
      this.toggleWrapperIDs.push(wrapperIDs);
      radioButton.observe('click', this.onRadioButtonClick.bind(this));
    }.bind(this));
    
    this.toggleWrapperIDs = this.toggleWrapperIDs.flatten().uniq()
    
    this.effect = "none";
    this.toggle();
    
    this.effect = options.effect || Toggle.DefaultEffect;
  },
  
  onRadioButtonClick: function(event) {
    this.toggle();
  },
  
  toggle: function() {
    var group = this.element;
    var radioButton = this.radioButtons.find(function(b) { return b.checked });
    var wrapperIDs = this.toggleWrapperIDsFor[radioButton.identify()];
    var partitioned = this.toggleWrapperIDs.partition(function(id) { return wrapperIDs.include(id) });
    Toggle.show(partitioned[0], this.effect);
    Toggle.hide(partitioned[1], this.effect);
  }
});


/**
 * class Toggle.SelectBehavior < Behavior
 *  
 *  Allows you to toggle elements based on the selection of a combo box. Just
 *  set the <tt>rel</tt> attribute to "toggle[id1,id2,...]" on the each select
 *  option.
 *  
 *  Options
 *  - effect: This option specifies the effect that should be used when
 *    toggling. The default is "slide", but it can also be set to
 *    "blind", "appear", or "none".
**/
Toggle.SelectBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    
    var optionElements = this.element.select('option');
    
    this.toggleWrapperIDs = $A();
    this.toggleWrapperIDsFor = {};
    
    optionElements.each(function(optionElement) {
      var elements = Toggle.extractToggleObjects(optionElement.readAttribute('rel'))
      var wrapperIDs = elements.map(function(e) { return Toggle.wrapElement(e) }).invoke('identify');
      this.toggleWrapperIDsFor[optionElement.identify()] = wrapperIDs;
      this.toggleWrapperIDs.push(wrapperIDs);
    }.bind(this));
    
    this.toggleWrapperIDs = this.toggleWrapperIDs.flatten().uniq()
    
    this.effect = "none";
    this.toggle();
    
    this.effect = options.effect || Toggle.DefaultEffect;
  },
  
  onchange: function(event) {
    this.toggle();
  },
  
  toggle: function() {
    var combo = this.element;
    var option = $(combo.options[combo.selectedIndex]);
    var wrapperIDs = this.toggleWrapperIDsFor[option.identify()];
    var partitioned = this.toggleWrapperIDs.partition(function(id) { return wrapperIDs.include(id) });
    Toggle.show(partitioned[0], this.effect);
    Toggle.hide(partitioned[1], this.effect);
  }
});