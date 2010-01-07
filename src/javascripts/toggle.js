Object.extend(String.prototype, {
  anchorId: function() {
    var matches = this.match(/\#(.+)$/);
    if (matches) return matches[1];
  }
});

// Allows a link to toggle the display of another element. Just set the href
// of the link to the ID of the element you are toggling ("#toggle_me").
ToggleBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    this.toggleElementID = this.element.href.anchorId();
    if (this.toggleElementID) {
      this.toggleElement = $(this.toggleElementID);
      // this is needed because it is required by the SlideDown effect
      this.toggleElementWrapper = this.toggleElement.wrap($div({'class':'toggleWrapper', 'style':'display:none'}))
      this.effect = options.effect || 'slide';
      this.swap = options.swap;
      if (this.swap) ToggleBehavior.swapLinks[this.toggleElementID] = this.element;
      if (String(window.location).anchorId() == this.toggleElementID) this.onclick();
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
      var link = ToggleBehavior.swapLinks[this.toggleElementID];
      if (link) link.show();
    }
  }
});
ToggleBehavior.swapLinks = {};

// Allows a the selection of a checkbox to toggle an element or group of
// on and off elements. Just set the toggle_id or toggle_ids attribute on
// the checkbox.
CheckboxToggleBehavior = Behavior.create({
  initialize: function(options) {
    var idsAttr = this.element.attributes['toggle_ids'];
    var idAttr = this.element.attributes['toggle_id'];
    
    var elements = $A([]);
    if (idAttr) elements.push($(idAttr.value));
    if (idsAttr) $A(idsAttr.value.split(',')).each(function(id) { elements.push($(id)) });
    
    this.toggleElements = elements;
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
// elements on and off. Just set the toggle_id or toggle_ids attribute on
// the radio button.
RadioToggleBehavior = Behavior.create({
  initialize: function() {
    var ids = this.element.readAttribute('toggle_ids');
    var id = this.element.readAttribute('toggle_id');
    var groupName = this.element.readAttribute('name');
    
    var elements = $A([]);
    if (id) elements.push($(id));
    if (ids) $A(ids.value.split(',')).each(function(id) { elements.push($(id)) });
    
    this.toggleElements = elements;
    
    if (groupName) {
      if (!RadioToggleGroup.groups[groupName]) RadioToggleGroup.groups[groupName] = new RadioToggleGroup;
      RadioToggleGroup.groups[groupName].addBehavior(this);
    }
    
    this.groupName = groupName;
  },
  
  showElements: function() {
    this.toggleElements.invoke('show');
  },
  
  hideElements: function() {
    this.toggleElements.invoke('hide');
  }
});

RadioToggleGroup = Class.create({
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
Object.extend(RadioToggleGroup, {
  groups: {}
});


// Allows you to toggle elements based on the selection of a combo box. Just
// set the toggle_id or toggle_ids attribute on the combo box.
SelectToggleBehavior = Behavior.create({
  initialize: function() {
    var match = String(window.location).anchorId();
    if (match) {
      var combo = this.element;
      $A(combo.options).each(function(option, index) {
        var attribute = option.attributes['toggle_ids'];
        if (!attribute) attribute = option.attributes['toggle_id'];
        if (attribute && attribute.value.match(match)) combo.selectedIndex = index;
      });
    }
    this.lastShown = $A();
    this.updateSelection();
  },
  
  onchange: function(event) {
    this.updateSelection();
  },
  
  updateSelection: function() {
    var combo = this.element;
    var option = $(combo.options[combo.selectedIndex]);
    var attributes = option.readAttribute('toggle_ids');
    if (!attributes) attributes = option.readAttribute('toggle_id');
    
    if (this.lastShown.length != 0) {
      this.lastShown.each(Element.hide);
      this.lastShown.clear();
    }
    if (attributes) {
      attributes = attributes.split(",");
      attributes.each(function(attribute) {
        var element = $(attribute);
        if (element) {
          this.lastShown.push(element);
          element.show();
        }
      }.bind(this));
    }
  }
});