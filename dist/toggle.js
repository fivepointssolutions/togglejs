/*
 * toggle.js
 * 
 * dependencies: prototype.js, lowpro.js, effect.js
 * 
 * --------------------------------------------------------------------------
 * 
 * A LowPro and Prototype-based library with a collection of behaviors for
 * unobtrusively toggling elements on and off via links, checkboxes, selects,
 * etc.
 * 
 * --------------------------------------------------------------------------
 * 
 * Copyright (c) 2007-2010, Five Points Solutions, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

// Toggle namespace object
var Toggle = {
  
  // Returns everything after the first "#" character in a string. Used to
  // extract an anchor from a URL.
  extractAnchor: function(string) {
    var matches = String(string).match(/\#(.+)$/);
    if (matches) return matches[1];
  },
  
  // Returns the associated toggle elements in a string. For string
  // "toggle[one,two,three]" it will return the elements with IDs of "one",
  // "two", and "three".
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
// of the link to the ID of the element you are toggling ("#toggle_me"). If
// the behavior is created with the "swap" option set to true, a link that
// is visible will be hidden and a link that is hidden will be shown when the
// associated element is shown (and vise-versa).
Toggle.LinkBehavior = Behavior.create({
  initialize: function(options) {
    var options = options || {};
    this.toggleID = Toggle.extractAnchor(this.element.href);
    if (this.toggleID) {
      this.toggleElement = $(this.toggleID);
      // this is needed because it is required by the SlideDown effect
      if ($(this.toggleElement.parentNode).hasClassName('toggle_wrapper')) {
        this.toggleElementWrapper = $(this.toggleElement.parentNode);
      } else {
        this.toggleElementWrapper = this.toggleElement.wrap($div({'class':'toggle_wrapper', 'style':'display:none'}));
      }
      this.effect = options.effect || 'slide';
      this.swap = options.swap;
      this.element.behavior = this;
      Toggle.addLink(this.toggleID, this.element)
    }
  },
  
  onclick: function() {
    this._hideLink();
    if (this.effect == 'pop') {
      this.toggleElementWrapper.toggle();
      this._showLink();
    } else {
      Effect.toggle(
        this.toggleElementWrapper,
        this.effect,
        { afterFinish: function() { this._showLink(); }.bind(this) }
      );
    }
    return false;
  },
  
  _hideLink: function() {
    if (this.swap) this.element.hide();
  },
  
  _showLink: function() {
    if (this.swap) {
      var links = Toggle.links[this.toggleID];
      links = links.reject(function(l) { return l == this.element }.bind(this));
      links.invoke('show');
    }
  }
});
Toggle.links = {};
Toggle.addLink = function(id, element) {
  this.links[id] = this.links[id] || $A();
  this.links[id].push(element);
}

// Automatically open toogle a link if anchor is equal to the ID of the link's
// associated object.
Event.observe(window, 'dom:loaded', function() {
  var anchor = Toggle.extractAnchor(window.location);
  var links = Toggle.links[anchor];
  if (links) {
    var behavior = links.first().behavior;
    behavior.onclick();
  }
});

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
// set the rel attribute to "toggle[id1,id2,...]" on the each select option.
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