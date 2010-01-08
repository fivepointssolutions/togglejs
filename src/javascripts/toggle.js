// Namespace
var Toggle = {
  extractAnchor: function(string) {
    var matches = String(string).match(/\#(.+)$/);
    if (matches) return matches[1];
  },
  
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
  }
};

// Allows a link to toggle the display of another element. Just set the href
// of the link to the ID of the element you are toggling ("#toggle_me").
Toggle.LinkBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    this.toggleElementID = Toggle.extractAnchor(this.element.href);
    if (this.toggleElementID) {
      this.toggleElement = $(this.toggleElementID);
      // this is needed because it is required by the SlideDown effect
      this.toggleElementWrapper = this.toggleElement.wrap($div({'class':'toggleWrapper', 'style':'display:none'}))
      this.effect = options.effect || 'slide';
      this.swap = options.swap;
      if (this.swap) Toggle.swapLinks[this.toggleElementID] = this.element;
      if (Toggle.extractAnchor(window.location) == this.toggleElementID) this.onclick();
    }
  },
  
  onclick: function() {
    if (this.swap) this.element.hide();
    if (this.effect == 'pop') {
      this.toggleElementWrapper.toggle();
    } else {
      Effect.toggle(this.toggleElementWrapper, this.effect, {afterFinish: function() { this._swapInLink(); }.bind(this)});
    }
    this._swapInLink();
    return false;
  },
  
  _swapInLink: function() {
    if (!this.swap) {
      var link = Toggle.swapLinks[this.toggleElementID];
      if (link) link.show();
    }
  }
});
Toggle.swapLinks = {};

// Allows a the selection of a checkbox to toggle an element or group of
// on and off elements. Just set the rel attribute to "toggle[id1,id2,...]"
// on the checkbox.
Toggle.CheckboxBehavior = Behavior.create({
  initialize: function(options) {
    this.toggleElements = Toggle.extractToggleObjects(this.element.readAttribute('rel'));
    this.options = options || {};
    this.update();
  },
  
  onclick: function(event) {
    this.update();
  },
  
  update: function() {
    if (this.toggleElements && (this.toggleElements.size != 0)) {
      var method = null;
      var formElementMethod = null;
      if (this.options.invert) {
        method = this.element.checked ? 'hide' : 'show';
        formElementMethod = this.element.checked ? 'disable' : 'enable';
      } else {
        method = this.element.checked ? 'show' : 'hide';
        formElementMethod = this.element.checked ? 'enable' : 'disable';
      }
      this.toggleElements.each(function(element) { element[method](); Form.getElements(element).invoke(formElementMethod); });
    }
  }
});

// Allows a the selection of a radio button to toggle an element or group of
// elements on and off. Just set the rel attribute to "toggle[id1,id2,...]"
// on the radio button.
Toggle.RadioBehavior = Behavior.create({
  initialize: function() {
    var groupName = this.element.readAttribute('name');
    
    this.toggleElements = Toggle.extractToggleObjects(this.element.readAttribute('rel'));
    
    if (groupName) {
      if (!Toggle.radioGroups[groupName]) Toggle.radioGroups[groupName] = new Toggle.RadioGroup;
      Toggle.radioGroups[groupName].addBehavior(this);
    }
    
    this.groupName = groupName;
    
    if (this.checked) {
      this.showElements();
    } else {
      this.hideElements();
    }
  },
  
  showElements: function() {
    this.toggleElements.invoke('show');
  },
  
  hideElements: function() {
    this.toggleElements.invoke('hide');
  }
});

Toggle.RadioGroup = Class.create({
  initialize: function() {
    this.radioBehaviors = $A();
  },
  
  addBehavior: function(behavior) {
    this.radioBehaviors.push(behavior);
    this.installEventListeners(behavior.element);
  },
  
  installEventListeners: function(radio) {
    radio.observe('click', this.update.bind(this));
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
// set the rel attribute to "toggle[id1,id2,...]"
// on the each select option.
Toggle.SelectBehavior = Behavior.create({
  initialize: function() {
    var elements = $A();
    var options = this.element.select('option');
    options.each(function(option) {
      elements.push(Toggle.extractToggleObjects(option.readAttribute('rel')))
    });
    this.toggleElements = elements.flatten().uniq();
    this.updateSelection();
  },
  
  onchange: function(event) {
    this.updateSelection();
  },
  
  updateSelection: function() {
    var combo = this.element;
    var option = $(combo.options[combo.selectedIndex]);
    var elements = Toggle.extractToggleObjects(option.readAttribute('rel'));
    this.toggleElements.invoke('hide');
    elements.invoke('show');
  }
});